// Student Attendance System
// All data is saved in the browser using localStorage (no server needed).

var attendanceMessage = document.getElementById("attendance-message");
var attendanceBody = document.getElementById("attendance-body");
va
// ---------- Saving and loading ----------
function saveData() {
  try {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
  } catch (error) {
    showMessage(attendanceMessage, "Could not save data in this browser.", "error");
  }
}

function loadData() {
  var savedStudents = null;
  var savedAttendance = null;

  try {
    savedStudents = localStorage.getItem(STUDENTS_KEY);
    savedAttendance = localStorage.getItem(ATTENDANCE_KEY);
  } catch (error) {
    // localStorage is blocked, so we just use the sample data
  }

  if (savedStudents === null) {
    // First visit: start with the sample students
    students = getSampleStudents();
    attendance = {};
    saveData();
    return;
  }

  try {
    students = JSON.parse(savedStudents);
    attendance = savedAttendance ? JSON.parse(savedAttendance) : {};
  } catch (error) {
    // Saved data was damaged, so start fresh
    students = [];
    attendance = {};
  }
}

// ---------- Helper functions ----------
// Returns today's date as YYYY-MM-DD (the format used by the date input)
function getTodayString() {
  var today = new Date();
  var year = today.getFullYear();
  var month = String(today.getMonth() + 1).padStart(2, "0");
  var day = String(today.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// Shows a message. type is "error" or "success"
function showMessage(element, text, type) {
  element.textContent = text;
  element.className = "message message-" + type;
}

function clearMessage(element) {
  element.textContent = "";
  element.className = "message";
}

// Finds a student by roll number (returns undefined if not found)
function findStudent(roll) {
  for (var i = 0; i < students.length; i++) {
    if (students[i].roll.toLowerCase() === roll.toLowerCase()) {
      return students[i];
    }
  }
  return undefined;
}

// Gets the saved status ("Present", "Absent") or "Not marked"
function getStatus(roll, date) {
  if (attendance[date] && attendance[date][roll]) {
    return attendance[date][roll];
  }
  return "Not marked";
}

// ---------- Add student ----------
function addStudent(event) {
  event.preventDefault();
  clearMessage(formMessage);

  var roll = rollInput.value.trim();
  var name = nameInput.value.trim();

  // Roll number: digits only (0-9), for example 006
  var rollPattern = /^[0-9]+$/;

  // Name: letters only. Spaces, dots, apostrophes and hyphens are allowed
  // after the first letter (for example "Mary-Ann O'Neil"). Numbers are not.
  var namePattern = /^\p{L}[\p{L}\s.'-]*$/u;

  // Validation: empty fields
  if (roll === "") {
    showMessage(formMessage, "Please enter a roll number.", "error");
    rollInput.focus();
    return;
  }
  if (name === "") {
    showMessage(formMessage, "Please enter the student name.", "error");
    nameInput.focus();
    return;
  }

  // Validation: correct format
  if (!rollPattern.test(roll)) {
    showMessage(formMessage, "Roll number must contain digits only (0-9). Letters and symbols are not allowed.", "error");
    rollInput.focus();
    return;
  }
  if (!namePattern.test(name)) {
    showMessage(formMessage, "Student name must contain letters only. Numbers and symbols are not allowed.", "error");
    nameInput.focus();
    return;
  }

  // Validation: duplicate roll number
  if (findStudent(roll)) {
    showMessage(formMessage, "Roll number " + roll + " already exists. Use a different roll number.", "error");
    rollInput.focus();
    return;
  }

  // Everything is valid, so save the student
  students.push({ roll: roll, name: name, sample: false });
  saveData();

  studentForm.reset();
  rollInput.focus();
  showMessage(formMessage, name + " was added.", "success");
  refreshPage();
}

// ---------- Delete student ----------
function deleteStudent(roll) {
  var student = findStudent(roll);
  if (!student) {
    return;
  }

  var sure = window.confirm("Delete " + student.name + " (" + student.roll + ")? Their attendance records will also be removed.");
  if (!sure) {
    return;
  }

  // Remove the student from the list
  var remaining = [];
  for (var i = 0; i < students.length; i++) {
    if (students[i].roll !== student.roll) {
      remaining.push(students[i]);
    }
  }
  students = remaining;

  // Remove this student's attendance on every date
  for (var date in attendance) {
    delete attendance[date][student.roll];
  }

  saveData();
  clearMessage(formMessage);
  clearMessage(attendanceMessage);
  refreshPage();
}

// ---------- Mark attendance ----------
function markAttendance(roll, status) {
  clearMessage(attendanceMessage);

  // Validation: there must be at least one student
  if (students.length === 0) {
    showMessage(attendanceMessage, "Add a student before marking attendance.", "error");
    return;
  }

  // Validation: the student must exist
  var student = findStudent(roll);
  if (!student) {
    showMessage(attendanceMessage, "That student could not be found.", "error");
    return;
  }

  // Validation: a date must be selected
  var date = dateInput.value;
  if (date === "") {
    showMessage(attendanceMessage, "Please select a date first.", "error");
    return;
  }

  if (!attendance[date]) {
    attendance[date] = {};
  }
  attendance[date][student.roll] = status;

  saveData();
  refreshPage();
}

// ---------- Statistics ----------
function updateStats() {
  var date = dateInput.value;
  var total = students.length;
  var presentCount = 0;
  var absentCount = 0;

  for (var i = 0; i < students.length; i++) {
    var status = getStatus(students[i].roll, date);
    if (status === "Present") {
      presentCount++;
    } else if (status === "Absent") {
      absentCount++;
    }
  }

  var percentage = 0;
  if (total > 0) {
    percentage = Math.round((presentCount / total) * 100);
  }

  statTotal.textContent = total;
  statPresent.textContent = presentCount;
  statAbsent.textContent = absentCount;
  statPercentage.textContent = percentage + "%";
}

// ---------- Drawing the table ----------
// Helper: makes a button and connects a click action to it
function makeButton(text, className, onClick) {
  var button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.className = "btn btn-small " + className;
  button.addEventListener("click", onClick);
  return button;
}

function makeCell(text) {
  var cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

function renderTable() {
  var date = dateInput.value;
  var searchText = searchInput.value.trim().toLowerCase();

  attendanceBody.innerHTML = "";

  // Sort students by roll number (numbers are compared as numbers)
  var sortedStudents = students.slice().sort(function (a, b) {
    return a.roll.localeCompare(b.roll, undefined, { numeric: true });
  });

  var shownCount = 0;

  sortedStudents.forEach(function (student) {
    // Search by name or roll number
    var matchesName = student.name.toLowerCase().indexOf(searchText) !== -1;
    var matchesRoll = student.roll.toLowerCase().indexOf(searchText) !== -1;
    if (searchText !== "" && !matchesName && !matchesRoll) {
      return;
    }

    shownCount++;
    var row = document.createElement("tr");

    // Roll number
    row.appendChild(makeCell(student.roll));

    // Student name (with a "Sample" tag for sample students)
    var nameCell = makeCell(student.name);
    if (student.sample) {
      var tag = document.createElement("span");
      tag.className = "sample-tag";
      tag.textContent = "Sample";
      nameCell.appendChild(tag);
    }
    row.appendChild(nameCell);

    // Status badge
    var status = getStatus(student.roll, date);
    var statusCell = document.createElement("td");
    var badge = document.createElement("span");
    badge.textContent = status;
    if (status === "Present") {
      badge.className = "badge badge-present";
    } else if (status === "Absent") {
      badge.className = "badge badge-absent";
    } else {
      badge.className = "badge badge-unmarked";
    }
    statusCell.appendChild(badge);
    row.appendChild(statusCell);

    // Date
    row.appendChild(makeCell(date));

    // Action buttons
    var actionsCell = document.createElement("td");
    var actions = document.createElement("div");
    actions.className = "actions";

    actions.appendChild(makeButton("Present", "btn-present", function () {
      markAttendance(student.roll, "Present");
    }));
    actions.appendChild(makeButton("Absent", "btn-absent", function () {
      markAttendance(student.roll, "Absent");
    }));
    actions.appendChild(makeButton("Delete", "btn-delete", function () {
      deleteStudent(student.roll);
    }));

    actionsCell.appendChild(actions);
    row.appendChild(actionsCell);

    attendanceBody.appendChild(row);
  });

  // Message when there is nothing to show
  if (students.length === 0) {
    emptyMessage.textContent = "No students yet. Add your first student using the form above.";
    emptyMessage.hidden = false;
  } else if (shownCount === 0) {
    emptyMessage.textContent = "No students match your search.";
    emptyMessage.hidden = false;
  } else {
    emptyMessage.hidden = true;
  }
}

// Shows the sample notice only while sample students still exist
function updateSampleNotice() {
  var hasSample = false;
  for (var i = 0; i < students.length; i++) {
    if (students[i].sample) {
      hasSample = true;
    }
  }
  sampleNotice.hidden = !hasSample;
}

// Redraws everything on the page
function refreshPage() {
  renderTable();
  updateStats();
  updateSampleNotice();
}

// ---------- Start the app ----------
function startApp() {
  loadData();
  dateInput.value = getTodayString();

  studentForm.addEventListener("submit", addStudent);

  // Re-draw when the date changes or the user types in the search box
  dateInput.addEventListener("change", function () {
    clearMessage(attendanceMessage);
    if (dateInput.value === "") {
      showMessage(attendanceMessage, "Please select a date.", "error");
    }
    refreshPage();
  });
  searchInput.addEventListener("input", renderTable);

  refreshPage();
}

startApp();
