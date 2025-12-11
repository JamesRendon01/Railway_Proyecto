@echo off
REM -------------------------------
REM Script para restaurar la base de datos MySQL
REM -------------------------------

REM Configura estos datos según tu MySQL
SET DB_USER=root
SET DB_NAME=escapade_parfaite
SET SQL_FILE=db\backup.sql
SET MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

REM Crear la base de datos si no existe
%MYSQL_PATH% -u %DB_USER% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME%;"

REM Importar el archivo SQL
%MYSQL_PATH% -u %DB_USER% %DB_NAME% < %SQL_FILE%

echo.
echo Base de datos restaurada correctamente
pause
