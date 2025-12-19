@echo off
echo Installing dependencies...
call npm install

echo.
echo Generating Prisma client...
call npx prisma generate

echo.
echo Creating database...
call npx prisma db push

echo.
echo Seeding database...
call npm run seed

echo.
echo Installation complete!
echo.
echo To start the server, run: npm start
pause
