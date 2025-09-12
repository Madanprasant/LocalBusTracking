@echo off
echo Installing frontend dependencies...
cd frontend
npm install

echo.
echo Installing backend dependencies...
cd ..\backend
npm install geolib

echo.
echo All dependencies installed successfully!
