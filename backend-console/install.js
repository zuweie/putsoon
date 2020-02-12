/*
 * @Author: your name
 * @Date: 2019-12-10 18:20:05
 * @LastEditTime : 2020-02-03 16:50:24
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-mini-admin/libs/install.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const colors = require('colors/safe');
const inquirer = require('inquirer');
const shell    = require('shelljs');
const moment   = require('moment');
const bcrypt   = require('bcrypt');

let lockfile_name = '.mini-admin.locked'

function bcrypt_password(plaint_pass) {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(plaint_pass, salt);
    return hash;
}
function replace_money_symbol (txt) {
    return txt.replace(/\$/g, '\\$');
}
function is_module_exists (m) {
    console.log(colors.gray('checking module '+m+' ....'));
    let result = shell.exec('ls -all '+process.cwd()+'/node_modules/ | grep -v grep | grep '+m).stdout;
    return result != '';
}
function install_module(m) {
    if (!is_module_exists(m)) {
        console.log(colors.gray('install '+ m));
        shell.exec('npm install --save '+m);
    }else{
        console.log(m +' exists ...');
    }
}
module.exports = async function () {
    
        console.log(colors.green('checking the locked file...'));
        let lockfile_path = path.join(process.cwd(), lockfile_name);
        if (fs.existsSync(lockfile_path)) {
            throw 'mini-admin had installed. pls remove '+lockfile_name+ ' to continue...'
        }

        let question = [
            {
                type: 'input',
                name: 'nickname',
                message: "your nickname? "
            },
            {
                type: 'input',
                name: 'login',
                message: "your login account? ",
            },
            {
                type: 'input',
                name: 'password',
                message: "your login password? ",
            },
            {
                type: 'input',
                name: 'email',
                message: "your email? ",
            },
        ];

        let { nickname, login, password, email } = await inquirer.prompt(question);

        // 处理一下把$,换成 \$.
        nickname = replace_money_symbol(nickname);
        login = replace_money_symbol(login);
        password = replace_money_symbol(bcrypt_password(password));
        email = replace_money_symbol(email);

        /**
         * shell sequelize-cli
         */
        /** 0 build the .sequelizecr */
        shell.exec('touch .sequelizerc');
        /** copy the sequelizerc file to dest */
        shell.cp('-r', __dirname+'/build-stuff/sequelizerc', process.cwd()+'/.sequelizerc');

        shell.exec('npx sequelize-cli init --force');
        
        shell.rm('-rf', process.cwd()+'/database/config/database.json');
        
        // change the databse config file.
        shell.exec('pwd=`pwd` && sed "s:{pwd}:${pwd}:g" '+__dirname+'/build-stuff/sqlite.database.json.tpl'+' > '+process.cwd()+'/database/config/database.json');

        // 1 copy migration
        shell.cp('-r', __dirname+'/build-stuff/migrations/*.js', process.cwd()+'/database/migrations/');
        // 2 run migration
        shell.exec('npx sequelize-cli db:migrate');

        // 3 create a admin sheed

        // replace the admin-user name & pwd
        console.log(colors.green('generate the Admin user Seed ...'));

        shell.rm('-rf', __dirname+'/build-stuff/seeders/*');
        
        let datetime = moment(new Date()).format('YYYYMMDDHHmm');
        let tablename = 'AdminUsers';
        
        shell.exec('tablename="'+tablename+'" && nickname="'+nickname+'" && login="'+login+'" && password="'+password+'" && email="'+email+'" && sed -e "s:{tablename}:${tablename}:g" -e "s:{nickname}:${nickname}:g" -e "s:{login}:${login}:g" -e "s:{password}:${password}:g" -e "s:{email}:${email}:g" '+__dirname+'/build-stuff/seed-admin-user.js.tpl > '+__dirname+'/build-stuff/seeders/'+datetime+'-admin-user.js');
        
        // 4 copy the seeder file.
        shell.rm('-rf', process.cwd()+'/database/seeders/*');
        shell.cp('-r', __dirname+'/build-stuff/seeders/*.js', process.cwd()+'/database/seeders/');
        // 5 seeding...
        console.log(colors.green('seeding ...'));
        shell.exec('npx sequelize-cli db:seed:all');
        
        // 6 copy the model
        shell.cp('-r', __dirname+'/build-stuff/models/*.js', process.cwd()+'/database/models')
        
        // 7 copy the model wapper
        shell.cp('-r', __dirname+'/build-stuff/conn.js.tpl', process.cwd()+'/database/conn.js');

        // 8 copy the model wapper
        shell.cp('-r', __dirname+'/build-stuff/sequelize_model.js.tpl', process.cwd()+'/database/sequelize_model.js');
    }
