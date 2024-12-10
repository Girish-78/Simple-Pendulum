 let lengthSlider, massSlider;
let length = 1; // Default length in meters
let mass = 0.1; // Default mass in kg
let angle = Math.PI / 4; // Initial angle in radians
let angleVel = 0; // Angular velocity
let angleAcc = 0; // Angular acceleration
let gravity = 9.8; // Acceleration due to gravity
let originX, originY, bobX, bobY;
let dragging = false;
let play = false;
let slowMotion = false; // Slow motion toggle
let trajectory = [];
let totalEnergy; // Total mechanical energy
let timePeriod; // Time period of the pendulum

function setup() {
  createCanvas(800, 600);

  // Sliders
  lengthSlider = createSlider(0.5, 2, length, 0.01);
  lengthSlider.position(20, 20);
  massSlider = createSlider(0.02, 0.15, mass, 0.01);
  massSlider.position(20, 60);

  // Buttons
  createButton("Play").position(20, 100).mousePressed(() => (play = true));
  createButton("Pause").position(80, 100).mousePressed(() => (play = false));
  createButton("Reset").position(140, 100).mousePressed(resetPendulum);
  createButton("Slow Motion").position(200, 100).mousePressed(() => (slowMotion = !slowMotion));

  originX = width / 2;
  originY = 100;
  calculateTotalEnergy();
  calculateTimePeriod();
  updateBobPosition();
}

function draw() {
  background(220);

  // Draw fixed support
  fill(50);
  rect(originX - 10, originY - 10, 20, 20);

  // Update length and mass
  length = lengthSlider.value();
  mass = massSlider.value();
  calculateTimePeriod();

  // Update pendulum motion
  if (play && !dragging) {
    let dt = slowMotion ? 0.005 : 0.02; // Slower time step for slow motion
    angleAcc = (-gravity / length) * sin(angle);
    angleVel += angleAcc * dt;
    angle += angleVel * dt;
  }

  updateBobPosition();

  // Draw trajectory (dotted line)
  trajectory.push({ x: bobX, y: bobY });
  if (trajectory.length > 300) trajectory.shift(); // Limit trajectory length
  stroke(100, 100, 255, 150);
  strokeWeight(2);
  noFill();
  beginShape();
  for (let point of trajectory) {
    vertex(point.x, point.y);
  }
  endShape();

  // Draw pendulum
  stroke(0);
  strokeWeight(2);
  line(originX, originY, bobX, bobY);

  // Draw colorful bob
  fill(lerpColor(color(255, 100, 100), color(100, 100, 255), sin(angle) * 0.5 + 0.5));
  noStroke();
  ellipse(bobX, bobY, mass * 250); // Scaled bob size

  // Draw UI
  fill(0);
  noStroke();
  textSize(16);
  text(`Length: ${length.toFixed(2)} m`, lengthSlider.x + 160, lengthSlider.y + 15);
  text(`Mass: ${mass.toFixed(2)} kg`, massSlider.x + 160, massSlider.y + 15);
  text(`Time Period: ${timePeriod.toFixed(2)} s`, 20, 140);

  // Energy calculations
  let h = length * (1 - cos(angle)); // Height above the reference line
  let PE = mass * gravity * h; // Potential energy
  let KE = totalEnergy - PE; // Kinetic energy adjusted to maintain constant total energy
  if (KE < 0) KE = 0; // Prevent negative KE due to rounding errors

  text(`Kinetic Energy: ${KE.toFixed(2)} J`, 20, 160);
  text(`Potential Energy: ${PE.toFixed(2)} J`, 20, 180);
  text(`Total Mechanical Energy: ${totalEnergy.toFixed(2)} J`, 20, 200);
}

function updateBobPosition() {
  bobX = originX + length * 100 * sin(angle); // Scale length for display
  bobY = originY + length * 100 * cos(angle);
}

function mousePressed() {
  if (dist(mouseX, mouseY, bobX, bobY) < 20) {
    dragging = true;
    play = false;
  }
}

function mouseDragged() {
  if (dragging) {
    let dx = mouseX - originX;
    let dy = mouseY - originY;
    angle = atan2(dx, dy) - HALF_PI; // Calibrate angle based on mouse position
  }
}

function mouseReleased() {
  if (dragging) {
    dragging = false;
    play = true;
  }
}

function resetPendulum() {
  angle = Math.PI / 4; // Reset to initial angle
  angleVel = 0;
  trajectory = [];
  calculateTotalEnergy();
}

// Calculate total mechanical energy based on current settings
function calculateTotalEnergy() {
  let hMax = length * (1 - cos(angle)); // Maximum height
  totalEnergy = mass * gravity * hMax; // Set initial TME
}

// Calculate time period of the pendulum
function calculateTimePeriod() {
  timePeriod = 2 * Math.PI * sqrt(length / gravity);
}
