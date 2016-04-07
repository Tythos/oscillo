"""Defines test routines for oscillo.data.convert module
"""

import unittest
import tempfile
import os
from oscillo import data
from oscillo.data import convert

class ExcelTests(unittest.TestCase):
    def test_from(self):
        db = convert.Sqlite.load(data.get_path('test.sql'))
        wb = convert.Excel.fromSqlite(db)
        
    def test_to(self):
        wb = convert.Excel.load(data.get_path('test.xlsx'))
        db = convert.Excel.toSqlite(wb)
        
class SqliteTests(unittest.TestCase):
    def test_load(self):
        db = convert.Sqlite.load(data.get_path('test.sql'))
        db.close()
        
    def test_save(self):
        hFile, filePath = tempfile.mkstemp()
        os.close(hFile)
        db = convert.Sqlite.load(data.get_path('test.sql'))
        convert.Sqlite.save(db, filePath)
        self.assertTrue(os.path.exists(filePath))
        os.remove(filePath)
        
if __name__ == '__main__':
    unittest.main()
