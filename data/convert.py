"""Simple module for converting data sets between supported formats, rotating
   around a common standard (in-memory SQLite database).
"""

import xlrd
import xlwt
import sqlite3

class Excel:
    @staticmethod
    def toSqlite(wb):
        shi = wb.sheet_names()
        db = sqlite3.connect(':memory:')
        for sh in shi:
            ws = wb.sheet_by_name(sh)
            headers = [str(header.value) for header in ws.row(0)]
            schema = []
            table = []
            for col_ndx in range(ws.ncols):
                isLogical = [ws.row(row_ndx)[col_ndx].ctype is 4 for row_ndx in range(1,ws.nrows)]
                isNumeric = [ws.row(row_ndx)[col_ndx].ctype in [2,4] for row_ndx in range(1,ws.nrows)]
                if all(isLogical) or all(isNumeric):
                    schema.append('%s real' % headers[col_ndx])
                else:
                    schema.append('%s text' % headers[col_ndx])
            for row_ndx in range(1,ws.nrows):
                row = tuple([cell.value for cell in ws.row(row_ndx)])
                table.append(row)
            qry = 'CREATE TABLE "%s" (%s)' % (sh, ', '.join(schema))
            db.execute(qry)
            qry = 'INSERT INTO "%s" VALUES (%s)' % (sh, ','.join(['?'] * len(schema)))
            db.executemany(qry, table)
            db.commit()
        return db
        
    @staticmethod
    def fromSqlite(db):
        """Constructs an in-memory Excel workbook from the given SQLite database
           handle. This representation can then be saved to file or manipulated
           as desired. Unfortunately, values originally stored as logicals in
           an Excel file will be indistinguishable from numeric values.
        """
        tables = []
        wb = xlwt.Workbook()
        for row in db.execute('SELECT name FROM sqlite_master WHERE type="table"'):
            tables.append(row[0])
        for table in tables:
            ctypes = []
            headers = []
            ws = wb.add_sheet(table)
            for col_ndx, row in enumerate(db.execute('PRAGMA table_info("%s")' % table)):
                if row[2] == 'real':
                    ctypes.append(2)
                elif row[2] == u'text':
                    ctypes.append(1)
                else:
                    raise Exception('Unsupported SQLite type "%s"' % row[2])
                headers.append(row[1])
                ws.write(0, col_ndx, headers[-1])
            for row_num, row in enumerate(db.execute('SELECT * FROM "%s"' % table)):
                for col_ndx, value in enumerate(row):
                    ws.write(row_num + 1, col_ndx, value)
        return wb

    @staticmethod
    def save(wb, filePath):
        wb.save(filePath)
    
    @staticmethod
    def load(filePath):
        return xlrd.open_workbook(filePath)

class Sqlite:
    """SQLite in-memory database handles are the primary data storage mechanism
       for Oscillo, so no conversions are included here that would be specific
       to other formats. Save and Load behaviors are implemented, however, for
       convenience.
    """
    @staticmethod
    def save(db, filePath):
        fdb = sqlite3.connect(filePath)
        rows = [row for row in db.iterdump()]
        for row in rows[1:-1]:
            fdb.execute(row)
        fdb.commit()
        fdb.close()
        
    @staticmethod
    def load(filePath):
        return sqlite3.connect(filePath)
