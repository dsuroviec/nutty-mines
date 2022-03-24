import { useEffect, useState, useRef, useCallback } from "react";
import _ from "lodash";
import {
  GiSquirrel,
  GiPunchBlast,
  GiSkullCrossedBones,
  GiAcorn,
  GiOwl,
} from "react-icons/gi";
import {
  AiFillHeart,
  AiOutlineArrowDown,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineArrowUp,
} from "react-icons/ai";
import celebrate from "./assets/celebrate.m4a";
import themeSong from "./assets/themeSong.mp3";
import collision from "./assets/collision.ogg";
import owl from "./assets/owl.mp3";
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

//To do:
//pressing space or diff buttons consecutively causes clearTimeout issue
//points not resetting after die
//when change the grid, the owl goes wacko

const App = () => {
  const [[x, y]] = useState([10, 10]);
  const [[locationX, locationY], setLocation] = useState([
    y - 1,
    Math.floor(y / 2),
  ]);
  const [barriers, setBarriers] = useState<any>(null);
  const [blackout, setBlackout] = useState(false);
  const [win, setWin] = useState(false);
  const [[nutX, nutY], setNut] = useState([0, Math.floor(x / 2)]);
  const [lives, setlives] = useState(3);
  const [points, setPoints] = useState(0);
  const [blast, setBlast] = useState<any>([]);
  const [startWindow, setStartWindow] = useState(true);
  const [[owlX, owlY], setOwl] = useState([0, Math.floor(x / 2 - 1)]);
  const [inPlay, setInPlay] = useState(false);
  const playedThemeRef = useRef(false);
  const [difficulty, setDifficulty] = useState("Medium");
  const [animations, setAnimations] = useState(false);
  const [waitingForLevelStart, setWaitingForLevelStart] = useState(false);
  const [numOfHints, setNumOfHints] = useState(2);
  const [owlDirection, setOwlDirection] = useState<any>();
  const [squirrelDirection, setSquirrelDirection] = useState<any>("");
  //for some reason the owl does not stay on the grid if I increase
  //---size of the x and y
  console.log(x, y);
  //create a pathfinder or maze

  function maybePlayTheme() {
    if (!playedThemeRef.current) {
      let theme = new Audio(themeSong);

      theme.volume = 0.5;
      theme.play();

      playedThemeRef.current = true;
      theme.loop = true;
    }
  }

  //upon loading, player hits start, triggers theme music, and triggers barriers
  const handleStart = () => {
    // Start the song
    maybePlayTheme();

    if (animations === null) {
      setAnimations(true);
    }
    const timer = setTimeout(() => {
      setStartWindow(false);
      setAnimations(false);
      // setInPlay(true);
      // setBlackout(true);

      // startGame();
      return () => clearTimeout(timer);
    }, 2000);
  };

  //  The user can also press space bar to start a new game and turn inPlay to true
  useEffect(() => {
    if (inPlay === false && startWindow) {
      const handleKeyDown = (e: any) => {
        if (e.key === " ") {
          handleStart();
          e.preventDefault();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  });

  // Reset for a new level
  useEffect(() => {
    if (startWindow) {
      return;
    }

    if (barriers) {
      return;
    }

    // reset player position
    const newLocationX = x - 1;
    const newLocationY = Math.floor(y / 2);
    setLocation([newLocationX, newLocationY]);

    const numOfCells = x * y;

    // generate new barriers
    const numOfBarriers =
      difficulty === "Hard"
        ? numOfCells / 4
        : difficulty === "Easy"
        ? numOfCells / 8
        : difficulty === "Medium" && numOfCells / 5;

    const newBarriers: any = [];
    while (newBarriers.length < numOfBarriers) {
      const randomX = rand(0, x);
      const randomY = rand(0, y);

      if (
        `${randomX}x${randomY}` !== `${newLocationX}x${newLocationY}` &&
        `${randomX}x${randomY}` !== `${nutX}x${nutY}` &&
        !newBarriers.includes(`${randomX}x${randomY}`)
      )
        newBarriers.push(`${randomX}x${randomY}`);
    }

    setBarriers(newBarriers);

    // reset owl position
    setOwl([0, Math.floor(x / 2 - 1)]);

    // reset lives
    setlives(3);

    // reset blast
    setBlast([]);

    //reset user hints
    setNumOfHints(2);

    // reset win
    setWin(false);

    // don't allow movement
    setInPlay(false);

    // show barriers
    setBlackout(false);
    setWaitingForLevelStart(true);
  }, [barriers, startWindow, difficulty, x, y, nutX, nutY]);

  useEffect(() => {
    if (waitingForLevelStart) {
      // after 1s: hide barriers, allow movement
      const timeout = setTimeout(() => {
        setWaitingForLevelStart(false);
        setBlackout(true);
        setInPlay(true);
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [waitingForLevelStart]);

  //provides a temporary flash of a hint
  const hint = () => {
    if (numOfHints > 0 && inPlay) {
      setBlackout(false);
      setNumOfHints((numOfHints) => numOfHints - 1);
      const timer = setTimeout(() => {
        setBlackout(true);
        return () => clearTimeout(timer);
      }, 100);
    }
  };
  //generate random Owl

  useEffect(() => {
    if (inPlay === true) {
      const owlInt = setInterval(() => {
        const move = rand(0, 4);
        let owlDirection;
        if (move === 0 && owlX < x - 1) {
          owlDirection = "animate__animated animate__slideInDown";
          setOwl([owlX + 1, owlY]);
        } else if (move === 1 && owlX > 0) {
          owlDirection = "animate__animated animate__slideInUp";
          setOwl([owlX - 1, owlY]);
        } else if (move === 2 && owlY < y - 1) {
          owlDirection = "animate__animated animate__slideInLeft";
          setOwl([owlX, owlY + 1]);
        } else if (move === 3 && owlY > 0) {
          owlDirection = "animate__animated animate__slideInRight";
          setOwl([owlX, owlY - 1]);
        }
        setOwlDirection(owlDirection);
      }, 300);

      return () => clearInterval(owlInt);
    }
  }, [x, y, owlX, owlY, inPlay]);

  // Check to see if we ran out of lives
  useEffect(() => {
    if (!lives) {
      setInPlay(false);
      setPoints(0);
      const timeout = setTimeout(() => {
        // do something which will have the effect of resetting a new level
        setBarriers(null);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [lives]);

  //Listen to keyboard if up button, subtract from the x 1
  // if down, add to the x
  //if right, add to the y
  // ifLeft, subtract the y
  useEffect(() => {
    if (inPlay === true) {
      const handleKeyDown = (e: any) => {
        let newLocation;
        let direction;
        switch (e.key) {
          case "ArrowDown":
            newLocation = [locationX + 1, locationY];
            direction = "animate__animated animate__slideInDown";
            break;
          case "ArrowUp":
            newLocation = [locationX - 1, locationY];
            direction = "animate__animated animate__slideInUp";
            break;
          case "ArrowRight":
            newLocation = [locationX, locationY + 1];
            direction = "animate__animated animate__slideInLeft";
            break;
          case "ArrowLeft":
            newLocation = [locationX, locationY - 1];
            direction = "animate__animated animate__slideInRight";
            break;
          default:
        }

        if (!newLocation) {
          return;
        }

        // e.preventDefault();
        // if (e.repeat) {
        //   return;
        // }
        const [newX, newY] = newLocation;
        if (newX < 0 || newX >= x || newY < 0 || newY >= y) {
          return;
        }

        //as long as you haven't already hit this barrier, run the inner lines
        if (!blast.includes(`${newX}x${newY}`)) {
          // If you're trying to move to where a barrier is
          if (barriers.includes(`${newX}x${newY}`)) {
            let collide = new Audio(collision);
            collide.play();
            //Only apply css class to squirrel if it is not a barrier
            setSquirrelDirection("");

            // If you have at least one life
            if (lives > 0) {
              // Take one life away
              setBlast([...blast, `${newX}x${newY}`]);
              setlives((lives) => lives - 1);
            }
            return;
          }
          setLocation([newX, newY]);
          //as long as no barriers, apply class to squirrel movement
          setSquirrelDirection(direction);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [barriers, blast, inPlay, lives, locationX, locationY, nutX, nutY, x, y]);

  // If the owl and the player coincide
  useEffect(() => {
    if (`${owlX}x${owlY}` === `${locationX}x${locationY}`) {
      let owlKill = new Audio(owl);

      owlKill.play();
      setlives(0);
    }
  }, [locationX, locationY, owlX, y, owlY, x]);

  // Check to see if the player got the nut
  useEffect(() => {
    // If the new location is where the nut is
    if (locationX === nutX && locationY === nutY) {
      let celebration = new Audio(celebrate);
      celebration.volume = 0.2;
      celebration.play();

      setWin(true);
      setInPlay(false);
      setPoints((points) => points + 100);

      const timeout = setTimeout(() => {
        setBarriers(null);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, [locationX, locationY, nutX, nutY]);

  const handleDifficultyClick = useCallback(
    (diff) => () => {
      setPoints(0);
      setDifficulty(diff);
      setBarriers(null);
      setStartWindow(false);
      maybePlayTheme();
    },
    []
  );

  return (
    <div id="container">
      <div className="flash-maze">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${y}, 1fr)`,
            gridTemplateRows: `repeat(${x}, 1fr)`,
          }}
        >
          {_.times(x, (x) =>
            _.times(y, (y) => {
              const coords = `${x}x${y}`;
              console.log(coords);
              return (
                <div key={coords} className="cell barriers egg location">
                  {barriers?.includes(coords) &&
                    !blackout &&
                    startWindow !== true &&
                    coords !== "0x5" &&
                    !blast.includes(coords) && (
                      <GiSkullCrossedBones className={"crossbones"} />
                    )}

                  {blast.includes(coords) &&
                    !coords.includes(`${owlX}x${owlY}`) && (
                      <GiPunchBlast style={{ color: "red" }} />
                    )}

                  {coords === `${nutX}x${nutY}` && (
                    <GiAcorn className={"nut"} />
                  )}
                  {coords === `${locationX}x${locationY}` && (
                    <GiSquirrel
                      className={`squirrel
                        ${squirrelDirection}
                        ${
                          lives === 3
                            ? "green"
                            : lives === 2
                            ? "yellow"
                            : lives === 1
                            ? "orange"
                            : "red"
                        }`}
                    />
                  )}
                  {coords.includes(`${owlX}x${owlY}`) && (
                    <GiOwl className={`owl ${owlDirection}`} />
                  )}
                </div>
              );
            })
          )}

          {startWindow === true && (
            <div className="start-window">
              <h2
                className={`title animate__animated animate__wobble ${
                  animations === true && "animate__animated animate__hinge"
                }`}
              >
                Nutty Mines
              </h2>
              <ul className="instruction">
                <li>
                  <GiSquirrel className="bullets animate__animated animate__heartBeat" />{" "}
                  You are a most hungry squirrel...that nut is looking
                  scrumptious!
                </li>
                <li>
                  <GiSquirrel className="bullets animate__animated animate__heartBeat" />{" "}
                  Test your memory by avoiding the hidden dangers
                </li>
                <li>
                  <GiSquirrel className="bullets animate__animated animate__heartBeat" />{" "}
                  Controls: up, down, left, right
                </li>
                <li>
                  <GiSquirrel className="bullets animate__animated animate__heartBeat" />{" "}
                  Watch out! the owl is hungry too!
                </li>
                <li>
                  <GiSquirrel className="bullets animate__animated animate__heartBeat" />{" "}
                  Select difficulty, or press play/(space) to start Medium
                  difficulty
                </li>
              </ul>
              <button className="start-button" onClick={handleStart}>
                Play!
              </button>
            </div>
          )}
        </div>
        <div className="textField">
          <div className="lives">
            {lives}x <AiFillHeart className="heart" />
          </div>

          <div>
            {win === true
              ? "You Win!"
              : lives === 0
              ? "Ah Nutz!! Game Over!"
              : `Points: ${points}`}
          </div>
        </div>
        <div className="dpad">
          <AiOutlineArrowUp className="dpad-buttons dpad-up" />
          <AiOutlineArrowRight className="dpad-buttons dpad-right" />
          <AiOutlineArrowDown className="dpad-buttons dpad-down" />
          <AiOutlineArrowLeft className="dpad-buttons dpad-left" />
        </div>
        <button className="hint-btn" onClick={hint}>
          {numOfHints > 1
            ? `${numOfHints} Hints`
            : numOfHints > 0
            ? `${numOfHints} Hint`
            : "Kurt"}
        </button>
        {[
          { label: "Hard", diff: "Hard" },
          { label: "Medium", diff: "Medium" },
          { label: "Easy", diff: "Easy" },
        ].map(({ label, diff }) => (
          <button
            key={diff}
            className={`diff-buttons ${difficulty === label && "dflt-btn"}`}
            onClick={handleDifficultyClick(diff)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
