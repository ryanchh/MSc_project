# Automated assessment and feedback system

This is instruction about how to deploy automated assessment and feedback system on Mac OS X.

## Prerequisite

Please make sure you have installed node.js, Java[version 8-11] and MySQL.

## Install Jenkins

Please download Jenkins from [jenkins](https://jenkins.io/download/). Choose LTS version and download for Mac OS X and you will get a Jenkins WAR file.

1. Run the command `java -jar jenkins.war`.  
2. Browse to `http://localhost:8080`, wait for the unlock Jenkins page.![Unlock Jenkins page](https://jenkins.io/doc/book/resources/tutorials/setup-jenkins-01-unlock-jenkins-page.jpg)

3. Find the password for unlock Jenkins in console.![Copying initial admin password](https://jenkins.io/doc/book/resources/tutorials/setup-jenkins-02-copying-initial-admin-password.png)

4. Copy the password and paste it in Unlock Jenkins page.
5. Set your admin account and password. Install all suggested plugins.

### Configure Jenkins

1. Log in Jenkins with your admin account. 

2. Find `Jenkins location` at `Manage Jenkins/Configure System`, set your admin email address with Gmail account![image-20190830110526515 pm](/Users/ryan/Library/Application Support/typora-user-images/image-20190830110526515 pm.png)

3. Find `E-mail Notification` at end of `Manage Jenkins/Configure System`, set your SMTP server as `smtp.gmail.com`. Click `advanced` button, and set your Gmail account and SMTP port as `465`.![image-20190830111122798 pm](/Users/ryan/Library/Application Support/typora-user-images/image-20190830111122798 pm.png)

4. Go to `Manage Jenkins/Configure Global Security`, make sure  `CSRF Protection` and `Crumb Algorithm` are enabled.![image-20190830111518142 pm](/Users/ryan/Library/Application Support/typora-user-images/image-20190830111518142 pm.png)
5. In `Manage Jenkins/Manage Plugins`, install `Blue Ocean` plugin.

Now Jenkins is ready to use.

## Deploy Sails and MySQL

1. Log in to MySQL and create an empty database.

2. Install Sails with the following command

   ```
   npm install sails -g
   ```

3. Clone the project from this repository.

4. Find file `/config/jenkins.js`, replace username and password with your Jenkins username and password.

5. Find file `/config/datastores.js`, replace url to get connect to your MySQL database.

   ```
   module.exports.datastores={
   	default:{
   		adapter: 'sails-mysql',
   		url: 'mysql://user:password@host:port/database',
   	}
   }
   ```

6. Go to the root path of the project where `package.json` located, run `npm install` in terminal. Wait for the installation of dependencies.

7. Run `sails lift` to start Sails server. Sails will create table in database automatically.

8. Enter `http://localhost:1337/set_admin` in your browser to set the first admin.

9. Press `control`+`C` to stop Sails server. Find file `/config/policies.js`, uncomment the policy for staff.

   ```
   module.exports.policies={
        ...,
   //   staff:{
   //     '*':'authenticated'
   //   },
   }
   ```

10. Find file `/config/security.js`, set `csrf` to be true

11. Find file `/config/models.js`, set `migerate` to be `safe`

12. Log in to MySQL, execute the following sql with `schemaName` replaced by your schema name.

    ```
    alter table schemaName.coursework modify column script varchar(5000) ;
    ```

13. Enter `http://localhost:1337/login` in browser, now you can log in your admin account to create other users.

## User guide

### Staff users

Staff users have four element in their menu. 

1. Module

   In this section, staff can find all existing modules. And they can create new modules so that teachers and students can enrol. Only staff can create new module. Staff can also search module by module code or module title.

2. Teacher

   Teacher section will illustrate all existing teachers. Staff can search teachers by name or email.

3. Student

   All existing student are listed in this section. Staff can also search students by name or email.

4. New User

   Staff can create new user in this part. Teachers and students are not allowed to sign up themselves.

### Teacher users

Teacher users only have Module in the menu. In Module, teachers can enrol or unenrol module. For enrolled module, teachers can publish new coursework.
Please note that
1. the space in coursework title will be replace by underline in Jenkins server.
2. The repository should store the test code. 
3. The script is for student, teachers' test code will not be influenced by the script.
4. In the script, the word `studentEmail` and `studentRepository` will be replaced by real student email and repository.
5. Teacher's test code can be found at `${JENKINS_HOME}/workspace/coursework_name`

### Student users

Student users have one section, Module, in their menu. 

In Module, student users can enrol or drop module. They can find courseworks of enrolled module and post new attempt to finish the coursework. Student users can look for information about each attempt by clicking it. A pipeline will show the process of code build and test. The grade and report of a attempt will be generated after the automatically build and test is finished.

