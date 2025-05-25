@echo off
set URL=http://localhost:5678/index.html
set NUMAR_CLIENTI=50

for /L %%i in (1,1,%NUMAR_CLIENTI%) do (
  start /B curl -s %URL%
)
echo %NUMAR_CLIENTI%