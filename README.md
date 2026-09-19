# Student Attendance System

A simple web application for recording and managing student attendance, built with HTML, CSS, and JavaScript. It runs entirely in the browser, with no server or database needed.

## Features

- Add students with a roll number and name
- Mark each student as Present or Absent
- Save attendance by date
- Data is stored in the browser using localStorage, so it stays after refreshing the page

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Git and GitHub
- GitHub Actions (CI)
- GitHub Pages (deployment)

## Project Structure

```
Student-Attendance-System/
├── index.html    # Page structure
├── style.css     # Styling and layout
├── script.js     # Application logic and localStorage
└── README.md     # Project documentation
```

## How to Run Locally

1. Clone the repository:
```
   git clone https://github.com/Ahmad-Ali-210/Student-Attendance-System.git
```
2. Open the project folder.
3. Open `index.html` in your web browser.

## Live Demo

https://ahmad-ali-210.github.io/Student-Attendance-System/

(This link will work after you deploy with GitHub Pages in step 10.)

## DevOps Workflow

This project follows a simple DevOps process:

1. Source code is version-controlled with Git and hosted on GitHub.
2. A GitHub Actions workflow runs automatically on every push to the `main` branch.
3. The workflow checks that the project files are present and valid.
4. The app is deployed using GitHub Pages.

## Author

Ahmad Ali