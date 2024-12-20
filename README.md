![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/neerajgrg93.aem-copilot?style=for-the-badge&logo=visual-studio-code&color=blue)
![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/neerajgrg93.aem-copilot?style=for-the-badge&logo=microsoft&logoColor=green)
![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/stars/neerajgrg93.aem-copilot?style=for-the-badge&label=RATING&color=%2320b2aa)
![GitHub License](https://img.shields.io/github/license/adobe/aem-github-copilot?style=for-the-badge&color=%23008080)

# AEM GitHub Copilot Extension

This extension integrates the power of GitHub Copilot's GenAI capabilities into your development environment, providing context-specific assistance for Adobe Experience Manager (AEM) Edge Delivery Services. It's designed to put AEM expertise at your fingertips, enhancing productivity and efficiency in your development workflow.

## Features and Commands

### Create
Streamline the development of Edge Delivery Services blocks with LLM using Copilot LLM. This feature eliminates the need for manual creation of folders/files, enhancing the overall developer experience.

### Collection
Access standard blocks from the AEM block collection directly, eliminating the need to copy and paste blocks from the block-collection repository and increasing the adoption of standard blocks.

### Docs
Provides a comprehensive search functionality through the aem.live documentation. It's specifically tailored to help you find any information related to Edge Delivery Services swiftly and accurately, minimizing the time spent on searching for specific documentation and thereby increasing your productivity.

### Issues
Get detailed descriptions of GitHub issues for your project, along with Copilot's suggestions for resolutions and improvements. This feature enables a more interactive and guided approach to issue resolution, leveraging AI to suggest potential fixes and optimizations.

### Vision
Create AEM Edge Delivery Services blocks using vision. This command allows you to generate blocks based on provided images, enhancing the visual development experience. *Currently available for VSCode Insiders only.*

### Annotate
Apply AEM best practices to your code. This command provides annotations and suggestions to improve your code's readability, maintainabilisty, and performance based on AEM standards. *Can be accessed from the editor menu.*


## How to Contribute

We welcome contributions to improve this extension! To contribute, follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them with clear and concise messages.
4. Push your changes to your fork.
5. Create a pull request to the main repository.

Please ensure your code follows the project's coding standards and includes appropriate tests.

## Start Locally

To start the extension locally for development:

1. Clone the repository:
    ```sh
    git clone https://github.com/adobe/aem-github-copilot.git
    ```
2. Navigate to the project directory:
    ```sh
    cd aem-github-copilot
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```
4. Open the project in Visual Studio Code:
    ```sh
    code .
    ```
5.  Run the `Run Extension` target in the Debug View. This will:
	- Start a task `npm: watch` to compile the code
	- Run the extension in a new VS Code window
	- You will see the @aem chat participant show in the GitHub Copilot Chat view

## Publish

To publish the extension to the Visual Studio Marketplace:

1. Ensure you are logged in to your Visual Studio Marketplace account.
2. Run the following command to package the extension:
    ```sh
    vsce package
    ```
3. Publish the extension:
    ```sh
    vsce publish
    ```

Make sure to update the version number in [package.json](http://_vscodecontentref_/1) before publishing.


## Demo

Check out the demo to see the extension in action:

![Demo](https://github.com/adobe/aem-github-copilot/blob/main/resources/demo.gif?raw=true)
