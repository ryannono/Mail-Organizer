# Mail-Organizer-Using-Cohere-Classify

Mail-Organizer-using-Cohere-Classify is a TypeScript application that helps you to automatically organize your emails into different folders based on the classification results obtained from the Cohere API. This application makes use of node-imap for email handling and axios for making API requests.

## Features

1. Parses email messages and extracts necessary data for classification.
2. Cleans and formats message data for classification input.
3. Classifies email messages using the Cohere classification API.
4. Moves classified email messages to respective folders based on classification results.

## Installation

Before you get started, make sure to set up a `.env` file in your project root directory with the following environment variables:

```env
EMAIL_PASSWORD=your_email_password
EMAIL_ADDRESS=your_email_address
EMAIL_HOST=your_email_host
COHERE_API_KEY=your_cohere_api_key
```

Install the required packages by running:

```sh
npm install
```

## Usage

To start using the Mail Organizer, execute the following command:

```sh
npm start
```

This command will initiate the IMAP connection and start organizing your emails based on the predefined classifications.

## Code Overview

### index.ts

Initializes the IMAP connection and listens for different IMAP events. Once the IMAP connection is ready, it fetches all email messages and initiates the parsing and handling processes.

### imap.ts

Contains the configuration for the IMAP client, which uses environment variables to set up the connection.

### parseMsg.ts

Defines functions to clean and parse email messages. It extracts the relevant information required for classification from the raw email data.

### handleParsedMsg.ts

This script is responsible for handling parsed email messages. It sends batches of parsed messages to the Cohere API for classification and then handles the classification results.

### classifyMsg.ts

Defines a function that moves email messages to different folders based on the classification results obtained from the Cohere API.

## Development

Here are a few scripts that you can use:

- `npm run build`: Compiles the TypeScript files to JavaScript.
- `npm run lint`: Lints the project using ESLint.
- `npm test`: Run unit tests (You need to create test files first).

## Contributing

If you would like to contribute to the development of this project, please follow the [contribution guidelines](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or require further assistance, feel free to create an issue in the GitHub repository.

## Acknowledgments

- [Cohere](https://www.cohere.ai/) for providing the classification API.
- [node-imap](https://www.npmjs.com/package/node-imap) for the IMAP client used to interact with the email server.
- [axios](https://www.npmjs.com/package/axios) for handling API requests.

Thank you for using Mail-Organizer-using-Cohere-Classify!
