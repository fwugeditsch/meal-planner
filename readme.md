# Meal-Planner

Meal-Planner is a web application built with Node.js that provides an easy way to manage and organize meal plans. The application handles backend logic using JavaScript and stores meal data in a SQLite database.

## Features
- **Meal Management**: Add, edit, and remove meals in a structured meal plan.  
- **Weekly Meal Planning**: Browse through different weeks and view planned meals.  
- **Navigation**: Switch between previous and upcoming weeks, with buttons dynamically enabling or disabling based on available data.  
- **Database Storage**: Meals are persisted in an SQLite database for easy management.  
- **Simple Setup**: Minimal dependencies, making it easy to run on local machines.  

## Technologies Used
- **Backend**: Node.js with Express.js for handling HTTP requests.  
- **Database**: SQLite for lightweight, file-based storage.  
- **Frontend**: JavaScript, HTML, and CSS for a simple and responsive user interface.  

## Running the Application Locally
To start the application in your local network, use the following command:  

```sh
node server.js
```
Make sure that you are in the root directory where *[server.js](https://github.com/fwugeditsch-tgm/meal-planner/blob/main/server.js)* is located.

## Future Enhancements (Planned Features)
- **User Authentication**: Implement login functionality for personalized meal plans.
- **Recipe Integration**: Link meals with recipes and ingredient lists.
- **Shopping List Generation**: Automatically create shopping lists based on planned meals.
- **API Endpoints**: Expose meal data through a RESTful API for integrations.
- **Mobile Support**: Improve UI responsiveness for mobile devices.
