"""Simple module for converting data sets between supported formats, rotating
   around a common standard (in-memory SQLite database).
"""

import xlrd, xlwt
import sqlite3

def isCellNumeric(cell):
    val = None
    try:
        val = float(cell)
    except:
        pass
    return val is not None
    
def isCellLogical(cell):
    if cell in [True,False]:
        return True
    elif cell.lower() in ['t', 'true', 'f', 'false']:
        return True
    else:
        return False

class Excel:
    @staticmethod
    def toSqliteType(cell):
        if cell.ctype in [0,1,6]: # string
            return str(cell.value), 'text'
        elif cell.ctype is 2: # numeric
            return float(cell.value), 'real'
        elif cell.ctype is 4: # logical
            return cell.value.lower() in ['t','true']
        else:
            raise Exception('SQLite type could not be cast')
            
    @staticmethod
    def toSqlite(filePath):
        wb = xlrd.open_workbook(filePath)
        shi = wb.sheet_names()
        db = sqlite3.connect(':memory:')
        for sh in shi:
            ws = wb.sheet_by_name(sh)
            headers = [str(header) for header in ws.row(0)]
            table = []
            schema = []
            for row_ndx in range(1,ws.nrows):
                table.append(ws.row(row_ndx))
            for col_ndx, header in enumerate(headers):
                if all([isCellNumeric(row[col_ndx]) for row in table]):
                    schema.append('%s real' % headers[col_ndx])
                    for row in table:
                        row[col_ndx] = float(row[col_ndx])
                elif all([isCellLogical(row[col_ndx]) for row in table]):
                    schema.append('%s real' % headers[col_ndx])
                    for row in table:
                        row[col_ndx] = row[col_ndx] is True or (type(row[col_ndx]) in [type(''),type(u'')] and row[col_ndx].lower() in [True,'t','true'])
                        row[col_ndx] = float(row[col_ndx])
                else:
                    schema.append('%s text' % headers[col_ndx])
            db.execute('CREATE TABLE %s (%s)' % (sh, ', '.join(schema)))
            db.executemany('INSERT INTO %s VALUES (%s)' % (sh,'?'), table)
            db.commit()
        return db
        
    @staticmethod
    def fromSqlite(db):
        pass
