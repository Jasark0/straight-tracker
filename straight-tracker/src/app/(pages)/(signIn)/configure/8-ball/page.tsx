"use client";

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from '@/src/components/Header';

const Select: React.FC = () => {
    const router = useRouter();

    const searchParams = useSearchParams();
    let matchID = searchParams.get('matchID');
    const [gameName, setGameName] = useState('');
    const [player1, setPlayer1] = useState('');
    const [player2, setPlayer2] = useState('');
    const [raceTo, setRaceTo] = useState('5');
    const [sets, setSets] = useState('');
    const [enableSets, setEnableSets] = useState(false);
    const [oddWarning, setOddWarning] = useState('');
    const [raceWarning, setRaceWarning] = useState('');
    const [breakFormat, setBreakFormat] = useState<"Winner Breaks" | "Alternate Breaks">();

    const [lagPopup, setLagPopup] = useState(false);
    const [lagWinnerSelected, setLagWinnerSelected] = useState<'player1' | 'player2' | null>(null);

    const [id, setId] = useState<number>();

    const [toBreak, setToBreak] = useState('');
    const [player1Score, setPlayer1Score] = useState<number>(0);
    const [player2Score, setPlayer2Score] = useState<number>(0);

    const raceSets = parseInt(sets) !== undefined ? Math.floor(parseInt(sets) / 2) + 1 : null; //Converts best of to race to (sets)
    const [player1Set, setPlayer1Set] = useState<number | undefined>();
    const [player2Set, setPlayer2Set] = useState<number | undefined>();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (/^\d*$/.test(val)) {
            setSets(val);
            
            if (val === ''){
                setOddWarning('');
            } 
            else{
                const num = parseInt(val, 10);
                if (num <= 0){
                    setOddWarning('Please enter a number greater than 0.');
                } 
                else if (num % 2 === 0){
                    setOddWarning('Only odd numbers are allowed (1, 3, 5, ...).');
                } 
                else{
                    setOddWarning('');
                }
            }
        }
    };
    
    const handleToggleSets = (checked: boolean) => {
        setEnableSets(checked);
        if (checked){
            setSets('3');
        }   
        else{
            setSets('');
        }
    };

    const handleNewRace = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;


        if (/^\d*$/.test(val)) {
            setRaceTo(val);
            
            if (val === ''){
                setRaceWarning('Please enter a number greater than 0.');
            } 
            else{
                const num = parseInt(val);
                const minRaceVal = Math.max(player1Score, player2Score) + 1;
                if (num < minRaceVal){
                    setRaceWarning(`New race to value too small.  Minimum value is ${minRaceVal}`);
                } else {
                    setRaceWarning('');
                }
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (oddWarning){
            toast.error('Fix the Best of (Sets): input.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }

        if (raceWarning){
            toast.error(raceWarning, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });
            return;
        }
        
        await updateMatchConfig(null);
    };

    const updateMatchConfig = async (finalLagWinner: string|null) => {
        try {
            if (!matchID) return;

            const res = await fetch(`/api/updateMatchConfiguration?matchID=${matchID}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    game_type: 0,
                    game_name: gameName,
                    player1: player1,
                    player2: player2,
                    race_to: parseInt(raceTo),
                    break_format: breakFormat == "Winner Breaks" ? 0 : 1,
                    lag_winner: finalLagWinner,
                    to_break: toBreak,
                    sets: sets ? parseInt(sets) : null,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('API error:', errorData.error);
                return;
            }

            router.push(`/tracker/8-ball?matchID=${matchID}`);
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    }

    useEffect(() => { //Get match info
        const fetchMatch = async () => {
            try{
                if (!matchID) return;
                const res = await fetch(`/api/getPoolMatch?matchID=${matchID}`);
                const json = await res.json();

                setGameName(json.poolMatch.game_name);
                setPlayer1(json.poolMatch.player1);
                setPlayer2(json.poolMatch.player2);
                setRaceTo(json.poolMatch.race_to);
                setBreakFormat(json.poolMatch.to_break == 0 ? "Winner Breaks" : "Alternate Breaks");
                setToBreak(json.poolMatch.to_break);
                
                const raceCount = json.matchRace.length;
                setId(json.matchRace[raceCount-1].id);
                setPlayer1Score(json.matchRace[raceCount-1].player1_score); 
                setPlayer2Score(json.matchRace[raceCount-1].player2_score);

                const setsEnabled = json.matchSets.sets !== undefined;
                handleToggleSets(setsEnabled)

                if (setsEnabled) {
                    const p1SetWins = json.matchRace.filter((set: any) => set.player1_score === json.poolMatch.race_to).length;
                    const p2SetWins = json.matchRace.filter((set: any) => set.player2_score === json.poolMatch.race_to).length;

                    setPlayer1Set(p1SetWins);
                    setPlayer2Set(p2SetWins);
                } else {
                    setPlayer1Set(undefined);
                    setPlayer2Set(undefined);
                } 
                
                setSets(json.matchSets.sets || undefined); //Load sets last: this prevents rendering inconsistencies.
            }
            catch (err){
                setError('Error');
            }
            finally{
                setLoading(false);
            };
        }
        fetchMatch();
    }, [matchID]);

    if(loading) { //Loading screen
        return (
            <div className="page-box">
                <div className="loading-screen">
                    <Header/>
                    <div className="loading-content">
                        <p>Loading match configuration...</p>
                        <img src="/spinner.gif" className="spinner-css" alt="Loading..."></img>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="select-page-box">
            <Header className={`home-title-box ${lagPopup ? "blurred" : ""}`}></Header>
            <ToastContainer/>
            <div className={`select-box ${lagPopup ? "blurred" : ""}`}>
                <form onSubmit={handleSubmit}>
                    <p className="game-name-message">Game name:</p>
                    <input className="game-name-input" type="text" placeholder="Game Name (optional)" value={gameName} onChange={(e) => setGameName(e.target.value)} />
                    
                    <img src="/divider.png" className="divider-css"></img>

                    <div className="names-selection-box">
                        <div className="player-names">
                            <label className="player-names-label">Player 1:</label>
                            <input className="player-names-input" type="text" placeholder="Type your name" value={player1} onChange={(e) => setPlayer1(e.target.value)} />
                        </div>

                        <div className="player-names">
                            <label className="player-names-label">Player 2:</label>
                            <input className="player-names-input" type="text" placeholder="Type your name" value={player2} onChange={(e) => setPlayer2(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="race-sets-box">
                        <div className="race-box">
                            <label className="race-label">Race to:</label>
                            <input
                                className="race-input"
                                type="text"
                                inputMode="numeric"
                                pattern="^[1-9][0-9]*$"
                                value={raceTo}
                                onChange={handleNewRace}
                                required
                                title="Please enter a number greater than 0."
                            />
                            <label className="sets-toggle-label">
                            <input
                                type="checkbox"
                                checked={enableSets}
                                onChange={(e) => handleToggleSets(e.target.checked)}
                            />
                                Enable Sets
                            </label>
                        </div>
                        
                        {enableSets && (
                            <div className="sets-box">
                            <div className="sets-info-box">
                                <label className="sets-label">Best of (Sets):</label>
                                <button className="sets-icon">i</button>
                            </div>

                            <div className="sets-info-box">
                                <input
                                className="sets-input"
                                type="text"
                                inputMode="numeric"
                                pattern="^\d*$"
                                value={sets}
                                onChange={handleChange}
                                required
                                title="Please enter a positive odd number greater than or equal to 3."
                                />
                            </div>

                            {oddWarning && <p className="warning-css">{oddWarning}</p>}
                            </div>
                        )}
                    </div>


                    <div className="break-box">
                        <label className="break-label">Break Format:</label>
                        <div className="break-format-box">
                            <label className="break-format-text">
                                <input type="radio" name="break" value="Winner Breaks" checked={breakFormat === "Winner Breaks"} 
                                onChange={() => setBreakFormat("Winner Breaks")} /> Winner Breaks 
                            </label>
                            <label className="break-format-text">
                                <input type="radio" name="break" value="Alternate Breaks" checked={breakFormat === "Alternate Breaks"} 
                                onChange={() => setBreakFormat("Alternate Breaks")} /> Alternate Breaks
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="submit-button">Update Match</button>
                </form>
            </div>
        </div>
    )
}

export default Select;
