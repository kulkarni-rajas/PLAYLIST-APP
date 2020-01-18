# PlayPal

![](https://github.com/lugnitdgp/PlayPal/blob/master/public/Demo.gif)
[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com)
<br>
[![Join the chat at https://gitter.im/NIT-dgp/General](https://badges.gitter.im/NIT-dgp/General.svg)](https://gitter.im/NIT-dgp/General?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![GSoC Heat 2020](https://img.shields.io/badge/GSoC%20Heat-2019-orange.svg)](https://nitdgpos.github.io/gsoc_heat)
<br>
[![forthebadge](https://forthebadge.com/images/badges/uses-html.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/uses-css.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/uses-js.svg)](https://forthebadge.com)
[![forthebadge](https://forthebadge.com/images/badges/uses-git.svg)](https://forthebadge.com)


An app for finding songs later to be added to a playlist where they will be playable

## Contribution guidelines
Kindly follow [contributing.md](contributing.md), if you want to lend a hand in making this project better.

## Build Setup

### Requirements:

* NodeJS
   - [guide](https://nodejs.org/en/download/)
 
* npm
   - [guide](https://docs.npmjs.com/cli/install)
 
* Mongodb
  - The database used in the app is MongoDB, so it must be configured on you local machine. Follow the [guide](https://docs.mongodb.com/manual/administration/install-on-linux/) if you dont have MongoDB installed

```bash


#Make Directory 
mkdir project
cd project

#Clone the Repository
git clone https://github.com/harshith331/PlayPal.git

#Change directory
cd PLALIST-APP

#Start MongoDB
sudo service mongod start
#Check Status
sudo service mongod status

#Launch App by
node app.js

#App hosted at 
http://localhost:3000/
