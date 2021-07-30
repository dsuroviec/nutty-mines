import React, { useEffect, useState } from "react";
import { FaSkullCrossbones } from "react-icons/fa";
import { GiAcorn } from "react-icons/gi";
import { GiSquirrel } from "react-icons/gi";
import { AiFillHeart } from "react-icons/ai";

function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

const App = () => {
    const [[x, y], setXY] = useState([11, 11]);
    const [[locationX, locationY], setLocation] = useState([
        x - 1,
        Math.floor(y / 2),
    ]);
    const [cells, setCells] = useState([]);
    const [barriers, setBarriers] = useState([]);
    const [numOfBarriers, setNumOfBarriers] = useState(11);
    const [blackout, setBlackout] = useState(false);
    const [win, setWin] = useState(false);
    const [[nutX, nutY], setNut] = useState([0, Math.floor(x / 2)]);
    const [lives, setlives] = useState(3);
    const [points, setPoints] = useState(0);
    const [newMaze, setNewMaze] = useState(false);

    // generates new maze initially and
    // when barriers or newMaze changes
    // creating an array of all grid locations in a string ["x,y",...]
    useEffect(() => {
        const newCells = [];
        for (let i = 0; i < x; i++) {
            for (let j = 0; j < y; j++) {
                newCells.push(`${i}x${j}`);
            }
        }
        setCells(newCells);
        //turns off blackout
        setBlackout(false);
        //resets squirrel location
        setLocation([x - 1, Math.floor(y / 2)]);
        //resets acorn location
        setNut([0, Math.floor(y / 2)]);
        setlives(3);
        setWin(false);

        //creates random barriers that don't fall on acorn or squirrel and pushes to barriers state
        const newBarriers = [];
        while (newBarriers.length < numOfBarriers) {
            const randomX = rand(0, x);
            const randomY = rand(0, y);

            if (
                `${randomX}x${randomY}` !== `${locationX}x${locationY}` &&
                `${randomX}x${randomY}` !== `${nutX}x${nutY}` &&
                !newBarriers.includes(`${randomX}x${randomY}`)
            )
                newBarriers.push(`${randomX}x${randomY}`);
        }

        setBarriers(newBarriers);
    }, [numOfBarriers, newMaze]);

    // allows the user to view the barriers upon creation of mase
    useEffect(() => {
        const timer = setTimeout(() => {
            setBlackout(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [newMaze]);

    //provides a temporary flash of a hint
    const hint = () => {
        setBlackout(false);
        setTimeout(() => {
            setBlackout(true);
        }, 100);
    };

    //change to seperate effects===>
    useEffect(() => {
        if (win === true) {
            const timeout = setTimeout(() => {
                setNewMaze(!newMaze);
            }, 2000);

            return () => clearTimeout(timeout);
        }

        if (lives === 0) {
            if (lives === 0) {
                const timer = setTimeout(() => {
                    setNewMaze(!newMaze);
                    setPoints(0);
                }, 2000);

                return () => clearTimeout(timer);
            }
        }
    }, [win, lives]);

    //Listen to keyboard if up button, subtract from the x 1
    // if down, add to the x
    //if right, add to the y
    // ifLeft, subtract the y
    useEffect(() => {
        const handleKeyDown = (e) => {
            let newLocation;

            switch (e.key) {
                case "ArrowDown":
                    newLocation = [locationX + 1, locationY];
                    break;
                case "ArrowUp":
                    newLocation = [locationX - 1, locationY];
                    break;
                case "ArrowRight":
                    newLocation = [locationX, locationY + 1];
                    break;
                case "ArrowLeft":
                    newLocation = [locationX, locationY - 1];
                    break;
                default:
            }

            if (!newLocation) {
                return;
            }

            e.preventDefault();

            const [newX, newY] = newLocation;

            if (newX < 0 || newX >= x || newY < 0 || newY >= y) {
                return;
            }

            // If you're trying to move to where a barrier is
            if (barriers.includes(`${newX}x${newY}`)) {
                // If you have at least one life
                if (lives > 0) {
                    // Take one life away
                    setlives((lives) => lives - 1);
                }

                return;
            }

            setLocation([newX, newY]);

            // If the new location is where the nut is
            if (newX === nutX && newY === nutY) {
                setWin(true);

                setPoints((points) => points + 100);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    });

    const setDifficulty = (val) => {
        setNumOfBarriers(cells.length / val);
        setNewMaze(!newMaze);
        setPoints(0);
    };

    return (
        <div id="container">
            <div className="flash-maze">
                Select your level, then use the arrow keys on your keyboard to
                navigate
                <div
                    className="grid"
                    style={{
                        gridTemplateColumns: `repeat(${y}, 1fr)`,
                        gridTemplateRows: `repeat(${x}, 1fr)`,
                    }}
                >
                    {cells.map((cell, index) => (
                        <div key={index} className="cell barriers egg location">
                            {barriers.includes(cell) &&
                            !blackout &&
                            cell !== "0x5" ? (
                                <FaSkullCrossbones />
                            ) : (
                                ""
                            )}
                            {cell === `${nutX}x${nutY}` &&
                            `${locationX}x${locationY}` !==
                                `${nutX}x${nutY}` ? (
                                <GiAcorn />
                            ) : (
                                ""
                            )}
                            {cell === `${locationX}x${locationY}` && (
                                <GiSquirrel />
                            )}
                        </div>
                    ))}
                </div>
                <div className="textField">
                    <div className="lives">
                        {lives}x <AiFillHeart className="heart" />
                    </div>
                    <div className="win">{win === true && "You Win!"}</div>
                    <div>{lives > 0 ? `Points: ${points}` : "Game Over!"}</div>
                </div>
                <button onClick={hint}>hint</button>
                <button onClick={() => setDifficulty(3)}>Hard</button>
                <button onClick={() => setDifficulty(9)}>Normal</button>
                <button onClick={() => setDifficulty(14)}>Easy</button>
            </div>
        </div>
    );
};

export default App;
