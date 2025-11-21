# **How To Set Up Development Enviroment (not needed because project already tracks necessary files)**
## Setting up the Enviroment and running the first time. 
To run the program, you'll need the following things: 
- change into the root directory: cd Bloch-Sphere-Simulator-App
- install vitejs by running the following commands: 
    - 'npm innit @vitejs/app'
    - select 'vanilla' using the arrows and press enter
    - select 'JavaScript'
    - it will give you the option to choose some new version and instantly run it. 
        - if you choose it it will start vite, to exit type q and press enter, to see all the commands type h and press enter. 
- install three js by running: 'npm install three'
- start the app locally by running: 'npm run dev'
Here is a [link to a video](https://www.youtube.com/watch?v=Q7AOvWpIVHU) that explains it pretty well. 
## Currently how to set it up: 
Requirements: 
- Node.js
- NPM package manager
Check if you meet requirements by running the 'node -v' and 'npm -v' commands respectively. 
- if either command gives you a version number, you have the necessary extensions installed and you're ready to go. 
The Setup: 
- run 'npm install three' to install the three.js 3D library. (these are files are ignored inside the .gitignore file, because it's an external library and our repository doesn't need to track it. This is why you have to install it before starting development. )
- run 'npm run dev' to start hosting locally, 
    - in the terminal you'll get a 'http://localhost:<portnumber>/' link, 
    - use 'ctrl+left_click' to open it and view the result of your code. **(DO NOT USE LIVE SERVER)**