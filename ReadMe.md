# **How To Set Up Development Enviroment (not needed because project already tracks necessary files)**
## Setting up the Enviroment and running the first time. 
To run the program, you'll need the following things: 
- change into the root directory: `cd Bloch-Sphere-Simulator-App`
- install vitejs by running the following commands: 
    - `npm innit @vitejs/app`
    - select `vanilla` using the arrows and press enter
    - select `JavaScript`
    - it will give you the option to choose some new version and instantly run it. 
        - if you choose it it will start vite, to exit type q and press enter, to see all the commands type h and press enter. 
- install three js by running: `npm install three`
- start the app locally by running: `npm run dev`

Here is a [link to a video](https://www.youtube.com/watch?v=Q7AOvWpIVHU) that explains it pretty well. 
>[!IMPORTANT]
>## Currently how to set it up: 
Requirements: 
- [Node.js](https://nodejs.org/en/download)
    - Use the powershell script (select the following options before copying it: Get Node.js®`v24.11.1(LTS)` for `Windows` using `Chocolatey` with `npm`)
- NPM package manager
>[!IMPORTANT]
>   - installing Node.js will also install npm!


Check if you meet requirements by running the `node -v` and `npm -v` commands respectively. 
- if either command gives you a version number, you have the necessary extensions installed and you're ready to go.

The Setup: 
- run `npm install three` to install the three.js 3D library. (these are files are ignored inside the .gitignore file, because it's an external library and our repository doesn't need to track it. This is why you have to install it before starting development. )
- run `npm run dev` to start hosting locally, 
    - in the terminal you'll get a `http://localhost:yourportnumber/` link, 
    - use `ctrl+left_click` to open it and view the result of your code. **(DO NOT USE LIVE SERVER)**

## TODOs
- [x] determine the issue with quantum gates. 
- [x] fix issues and or refactor gates **from 3×3** rotations **to** actual **2×2** complex unitaries on **(α, β)**
- [ ] [#2](https://github.com/dashBuresz/bloch-sphere-simulator-app-js/issues/2#issue-3653567156) figure out how to make this project able to be installed as a standalone browser app, that can be installed on a pc with just a browser and no development enviroment.
- [x] refactor this TODO list so each point references an issue.
