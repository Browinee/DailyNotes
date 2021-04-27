import * as fs from 'fs';

fs.writeFile('./newFile.txt', "asdfsa", (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log('File created successfully');
    }
});