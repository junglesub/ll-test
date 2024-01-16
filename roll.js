/**
 * Setup
 */
const debugEl = document.getElementById("debug"),
  // Mapping of indexes to icons: start from banana in middle of initial position and then upwards
  // iconMap = [
  //   "banana",
  //   "seven",
  //   "cherry",
  //   "plum",
  //   "orange",
  //   "bell",
  //   "bar",
  //   "lemon",
  //   "melon",
  // ],
  // Width of the icons
  // icon_width = 79,
  // Height of one icon in the strip
  icon_height = 79,
  // Number of icons in the strip
  num_icons = 9,
  // Max-speed in ms for animating one icon down
  time_per_icon = 100;
// Holds icon indexes
// indexes = [0, 0, 0];

const parseMatrix = (matrixa) => {
  const matrix = matrixa.replace("matrix", "").trim();
  console.log("original matrix", matrix);
  // const matrixPattern = /^\w*\((((\d+)|(\d*\.\d+)),\s*)*((\d+)|(\d*\.\d+))\)/i;
  const matrixPattern =
    /^\w*\((-?((\d+)|(\d*\.\d+)),\s*)*(-?(\d+)|(\d*\.\d+))\)/i;
  let matrixValue = [];
  if (matrixPattern.test(matrix)) {
    // When it satisfy the pattern.
    const matrixCopy = matrix.replace(/^\w*\(/, "").replace(")", "");
    console.log(matrixCopy);
    matrixValue = matrixCopy.split(/\s*,\s*/);
  }
  return matrixValue;
};

/**
 * Roll one reel
 */
const ROLL_CNT = 1;
const roll = (reel, offset = 0) => {
  const textNode = reel.querySelector(".text");

  // 시작하기 전에 3번 복사
  const originalNode = textNode.querySelector(".original");
  const NUM_TEXT = originalNode.children.length;
  const createdCloneNode = Array(ROLL_CNT + 1)
    .fill()
    .map(() => originalNode.cloneNode(true));
  createdCloneNode.map((node) => textNode.appendChild(node));
  const style = getComputedStyle(textNode);
  const innerTextStyle = getComputedStyle(originalNode.querySelector("div"));

  // Minimum of 2 + the reel offset rounds
  const delta =
    (offset + ROLL_CNT) * NUM_TEXT + Math.round(Math.random() * NUM_TEXT);

  console.log(reel, reel.style.height);

  console.log(innerTextStyle["paddingTop"]);
  const text_height =
      parseFloat(innerTextStyle["height"]) +
      parseFloat(innerTextStyle["paddingTop"]) +
      parseFloat(innerTextStyle["paddingBottom"]),
    lastPosY = Math.abs(parseMatrix(style["transform"])[5]),
    targetPosY = -(lastPosY + delta * text_height),
    normTargetPosY = targetPosY % (NUM_TEXT * text_height),
    animation_run_time = (8 + 1 * delta) * time_per_icon;

  // reel 크기 다시 확인 및 세팅
  reel.style.height = text_height + "px";

  console.table({
    NUM_TEXT,
    text_height,
    lastPosY,
    targetPosY,
    normTargetPosY,
    animation_run_time,
  });

  // DO THE ANIMATION
  textNode.style.transition = `transform ${animation_run_time}ms cubic-bezier(.41,-0.01,.63,1.09)`;
  // Set background position
  textNode.style.transform = `translateY(${targetPosY}px)`;

  // RESET Y Value
  setTimeout(() => {
    textNode.style.transition = "none";
    textNode.style.transform = `translateY(${normTargetPosY}px)`;

    // Remove clone nodes
    createdCloneNode.map((node) => textNode.removeChild(node));
  }, animation_run_time);

  return;
  return new Promise((resolve, reject) => {
    const style = getComputedStyle(reel),
      // Current background position
      backgroundPositionY = parseFloat(style["background-position-y"]),
      // Target background position
      targetBackgroundPositionY = backgroundPositionY + delta * icon_height,
      // Normalized background position, for reset
      normTargetBackgroundPositionY =
        targetBackgroundPositionY % (num_icons * icon_height);

    // Delay animation with timeout, for some reason a delay in the animation property causes stutter
    setTimeout(() => {
      // Set transition properties ==> https://cubic-bezier.com/#.41,-0.01,.63,1.09
      reel.style.transition = `background-position-y ${
        (8 + 1 * delta) * time_per_icon
      }ms cubic-bezier(.41,-0.01,.63,1.09)`;
      // Set background position
      reel.style.backgroundPositionY = `${
        backgroundPositionY + delta * icon_height
      }px`;
    }, offset * 150);

    // After animation
    setTimeout(() => {
      // Reset position, so that it doesn't get higher without limit
      reel.style.transition = `none`;
      reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
      // Resolve this promise
      resolve(delta % num_icons);
    }, (8 + 1 * delta) * time_per_icon + offset * 150);
  });
};

document.addEventListener("click", () => roll(document.querySelector(".reel")));
