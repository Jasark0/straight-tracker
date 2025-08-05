"use client";

import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useMemo } from 'react'
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '@/src/components/PageLoading'

export default function History() {
    type PoolMatch = {
        match_id: number;
        game_name: string;
        game_type: number;
        player1: string;
        player2: string;
        race_to: number;
        lag_winner: string;
        winner: string | null;
        created_at: string;
        pool_matches_race: {
            player1_score: number;
            player2_score: number;
        }[];
        pool_matches_sets: {
            sets: number;
        }
    };

    type StraightMatch = {
        match_id: number,
        game_name: string;
        player1: string;
        player2: string;
        race_to: number;
        player1_score: number;
        player1_high_run: number;
        player2_score: number;
        player2_high_run: number;
        winner: string | null;
        created_at: string;
    }

    const allGameTypes = ['8-Ball', '9-Ball', '10-Ball', 'straight-pool'];

    const gameTypeMap: Record<string, number | "straight"> = {
        "8-Ball": 0,
        "9-Ball": 1,
        "10-Ball": 2
    };

    const revGameTypeMap: Record<number, string> = {
        0: "8-Ball",
        1: "9-Ball",
        2: "10-Ball"
    }

    const router = useRouter();

    const [selectedGameType, setSelectedGameType] = useState('8-Ball');
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); //Sets a delay between new user search terms
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [playerName, setPlayerName] = useState("");
    const [debouncedPlayerName, setDebouncedPlayerName] = useState(playerName); //Sets a delay between new player name search terms

    const [allPoolMatches, setAllPoolMatches] = useState<PoolMatch[]>([]);
    const [allStraightMatches, setAllStraightMatches] = useState<StraightMatch[]>([]);
    const [showSelectModal, setShowSelectModal] = useState(false);
    const [selectedGame, setSelectedGame] = useState('');

    const [selectedPoolMatch, setSelectedPoolMatch] = useState<PoolMatch>();
    const [selectedStraightMatch, setSelectedStraightMatch] = useState<StraightMatch>();
    const [showPoolDetailsModal, setShowPoolDetailsModal] = useState(false);
    const [showStraightDetailsModal, setShowStraightDetailsModal] = useState(false);
    const [showDeletePoolModal, setShowDeletePoolModal] = useState(false);
    const [showDeleteStraightModal, setShowDeleteStraightModal] = useState(false);

    const today = new Date().toLocaleDateString('en-CA');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const gameSelect = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();

        const target = e.target as HTMLElement;

        if (!target.closest(".game-option")){
            setSelectedGame('');
        }
    }

    const selectPage = (selectedGameType: string) => {
        if (selectedGameType === "8 Ball"){
            router.push('/select/8-ball');
        }
        else if (selectedGameType === "9 Ball"){
            router.push('/select/9-ball'); 
        }
        else if (selectedGameType === "10 Ball"){
            router.push('/select/10-ball');
        }
        else if (selectedGameType === "Straight Pool (14.1 Continuous)"){
            router.push('/select/straight-pool'); 
        }
    }

    const continuePoolMatchPage = (match: PoolMatch) => {    
        router.push(`/tracker/pool-games?matchID=${match.match_id}`);
    }

    const continueStraightMatchPage = (match: StraightMatch) => {
        router.push(`/tracker/straight-pool?matchID=${match.match_id}`);
    }
    
    const deletePoolMatch = async () => {
        await fetch(`/api/deletePoolMatch?matchID=${selectedPoolMatch?.match_id}`, {
            method: 'DELETE',
        });
        
        window.location.reload();
    }

    const deleteStraightMatch = async () => {
        await fetch(`/api/deleteStraightMatch?matchID=${selectedStraightMatch?.match_id}`, {
            method: 'DELETE',
        });
        
        window.location.reload();
    }

    const availableGameTypes = useMemo(() => {
        const types = new Set<string>();

        allPoolMatches.forEach(match => {
            const gameTypeStr = revGameTypeMap[match.game_type];
            if (gameTypeStr) types.add(gameTypeStr);
        });

        if (allStraightMatches.length > 0) {
            types.add('straight-pool');
        }

        return Array.from(types);
    }, [allPoolMatches, allStraightMatches]);

    const earliestMatchDate = useMemo(() => {
        if (allPoolMatches.length === 0){
            return undefined;
        } 

        const lastMatch = allPoolMatches[allPoolMatches.length - 1];
        const date = new Date(lastMatch.created_at);

        return date.toLocaleDateString('en-CA');
    }, [allPoolMatches]);

    const filteredMatches = useMemo(() => {
        const gameNameSearch = debouncedSearchTerm.toLowerCase();
        const playerNameSearch = debouncedPlayerName.toLowerCase();

        const filterByDate = (createdAt: string) => {
            const date = new Date(createdAt);
            const matchDate = date.toLocaleDateString("en-CA");
            if (startDate && matchDate < startDate) return false;
            if (endDate && matchDate > endDate) return false;
            return true;
        };

        if (selectedGameType === "straight-pool") {
            return allStraightMatches
            .filter((match) => match.game_name.toLowerCase().includes(gameNameSearch) && filterByDate(match.created_at) &&
            (match.player1.toLowerCase().includes(playerNameSearch.toLowerCase()) || match.player2.toLowerCase().includes(playerNameSearch.toLowerCase())))
            .map((match) => ({
                ...match,
                type: "straight" as const
            }));
        }

        const selected = gameTypeMap[selectedGameType];

        return allPoolMatches
            .filter((match) => match.game_type === selected && match.game_name.toLowerCase().includes(gameNameSearch) && filterByDate(match.created_at) &&
            (match.player1.toLowerCase().includes(playerNameSearch.toLowerCase()) || match.player2.toLowerCase().includes(playerNameSearch.toLowerCase())))
            .map((match) => ({
                ...match,
                type: "pool" as const
            }));
    }, [allPoolMatches, allStraightMatches, selectedGameType, debouncedSearchTerm, startDate, endDate, debouncedPlayerName]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setPlayerName('');
    };

    useEffect(() => { //Get all matches
        const fetchAllMatches = async () => {
            setLoading(true);

            try{
                const res = await fetch('/api/getAllMatches');
                const json = await res.json();

                if (!res.ok){
                    setError(json.error);
                }

                setAllPoolMatches(json.allPoolMatches);
                setAllStraightMatches(json.allStraightMatches);

                setLoading(false);
            }
            catch (err){
                setError('Network error');
            }
        };
        fetchAllMatches();
    }, []);
    
    useEffect(() => { //Set a timeout to search game name
        if (searchTerm === "") {
            setDebouncedSearchTerm("");
            return;
        }

        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => { //Set a timeout to search player name
        if (playerName === "") {
            setDebouncedPlayerName("");
            return;
        }

        const handler = setTimeout(() => {
            setDebouncedPlayerName(playerName);
        }, 300);

        return () => clearTimeout(handler);
    }, [playerName]);

    useEffect(() => { //Toastify notification on reset password success
        const params = new URLSearchParams(window.location.search);

        if (params.get('success') === '1') {
            toast.success("Password updated successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
            });

            params.delete('success');
            router.replace(`${window.location.pathname}?${params.toString()}`);
        }
    }, [])

    if (loading){
        return <Loading/>;
    }

    return !loading && (
        <div className="history-page-container">
            <ToastContainer className="history-toast"/>
            <div className={`history-container ${showSelectModal ? "blurred" : ""}`}>
                <div className="history-new-game-container">
                    <button className="history-new-game-button" onClick={() => setShowSelectModal(true)}>+ New Game</button>
                </div>
                
                <div className="history-content-container">
                    <div className="history-filter-container">
                        <p className="history-filter-game-text">Game to display:</p>

                        {availableGameTypes.length === 0 ? (
                            <p className="history-filter-no-text">No matches found yet, make a new game today!</p>
                        ) : (
                            <div className="history-filter-grid">
                                {allGameTypes
                                    .filter(type => availableGameTypes.includes(type))
                                    .map((type) => (
                                    <button
                                        key={type}
                                        className={`history-filter-game-button ${selectedGameType === type ? 'active' : ''} ${type === 'straight-pool' ? 'smaller-font' : ''}`}
                                        onClick={() => setSelectedGameType(type)}
                                        >
                                        {type === 'straight-pool' ? <>Straight Pool <br /> (14.1 Continuous)</> : type}
                                    </button>
                                ))}
                            </div>
                        )}
                    
                        <p>Search game name:</p>
                        <div className="history-search-container">
                            <span className="history-search-icon">🔍</span>
                            <input className="history-search-input" placeholder="Search game name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                        </div>

                        <p>Filter by date:</p>
                        <div className="history-date-container">
                            <input type="date" className="history-date-input" placeholder="Start date" value={startDate} min={earliestMatchDate} max={endDate || today} 
                            onChange={(e) => setStartDate(e.target.value)}/>

                            <input type="date" className="history-date-input" placeholder="End date" value={endDate} min={startDate || undefined} max={today}
                            onChange={(e) => setEndDate(e.target.value)}/>
                        </div>

                        <p>Filter by player name:</p>
                        <div className="history-search-container">
                            <span className="history-search-icon">🔍</span>
                            <input className="history-search-input" placeholder="Search player name" value={playerName} onChange={(e) => setPlayerName(e.target.value)}/>
                        </div>

                        <button className="history-clear-button" onClick={handleClearFilters}>
                            Clear Filters
                        </button>
                    </div>
                    
                    <div className="history-matches-container">
                        {filteredMatches.length === 0 ? (
                            <p className="history-no-match-text">
                                No match history found. 
                            </p>
                        ) : (
                            <div>
                                <div className="history-matches-header">
                                    <span className="history-matches-header-game-type">
                                        {selectedGameType === 'straight-pool'                                                                                                                
                                            ? 'Straight Pool (14.1 Continuous)'
                                            : revGameTypeMap[parseInt(selectedGameType)] ?? selectedGameType} Matches
                                    </span>                                                                                         
                                    <span className="history-matches-count">
                                        {filteredMatches.length} match{filteredMatches.length !== 1 && 'es'} found
                                    </span>
                                </div>
                                {filteredMatches.map((match) => {
                                    if (match.type === "pool"){
                                        const lastRace = match.pool_matches_race?.[match.pool_matches_race.length - 1];
                                        
                                        let currentPlayer1Sets: number = 0;
                                        let currentPlayer2Sets: number = 0;
                                        const currentPlayer1Score: number = lastRace.player1_score;
                                        const currentPlayer2Score: number = lastRace.player2_score;
                
                                        if (match.pool_matches_sets) {
                                            currentPlayer1Sets = match.pool_matches_race?.filter(
                                                (race: any) => race.winner === 'player1'
                                            ).length ?? 0;

                                            currentPlayer2Sets = match.pool_matches_race?.filter(
                                                (race: any) => race.winner === 'player2'
                                            ).length ?? 0;
                                        }

                                        return (
                                            <div key={match.match_id} className="history-match-container" onClick={() => {setShowPoolDetailsModal(true); setSelectedPoolMatch(match);}}>
                                                <div className="history-match-row-container">
                                                    <span className="history-match-game-name-text">Game Name: {match.game_name}</span>
                                                    <span className="history-match-created-at-text">{new Date(match.created_at).toLocaleString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true, 
                                                    })}
                                                    </span>
                                                </div>

                                                <div className="history-match-row-container">
                                                    <span className="history-match-player-name-text">
                                                        {match.player1} vs. {match.player2}
                                                    </span>
                                                    <span className="history-match-score-text">
                                                        {match.pool_matches_sets
                                                        ? (
                                                            <>
                                                                Sets Score: <span className="history-match-current-sets-text">{currentPlayer1Sets}</span> - <span className="history-match-current-sets-text">{currentPlayer2Sets}</span> | 
                                                                Score: <span className="history-match-current-scores-text">{currentPlayer1Score}</span> - <span className="history-match-current-scores-text">{currentPlayer2Score}</span>
                                                            </>
                                                        )
                                                        : (
                                                            <>
                                                                Score: <span className="history-match-current-scores-text">{currentPlayer1Score}</span> - <span className="history-match-current-scores-text">{currentPlayer2Score}</span>
                                                            </>
                                                        )}
                                                    </span>
                                                </div>
                                                
                                                <div className="history-match-row-container">
                                                    <span></span>
                                                    <span className="history-match-button-container">
                                                        {match.winner === null && (
                                                            <button className="history-match-button continue" 
                                                            onClick={(e) => {e.stopPropagation(); continuePoolMatchPage(match);}}>
                                                                Continue Match
                                                            </button>
                                                        )}

                                                        <button className="history-match-button delete" 
                                                        onClick={(e) => {e.stopPropagation(); setShowDeletePoolModal(true); setSelectedPoolMatch(match);}}>
                                                            Delete Match
                                                        </button>
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    else if (match.type === 'straight'){
                                        return (
                                            <div key={match.match_id} className="history-match-container" onClick={() => {setShowStraightDetailsModal(true); setSelectedStraightMatch(match);}}>
                                                <div className="history-match-row-container">
                                                    <span className="history-match-game-name-text">Game Name: {match.game_name}</span>
                                                    <span className="history-match-created-at-text">{new Date(match.created_at).toLocaleString(undefined, {
                                                        year: 'numeric',
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true, 
                                                    })}
                                                    </span>
                                                </div>

                                                <div className="history-match-row-container">
                                                    <span className="history-match-player-name-text">
                                                        {match.player1} vs. {match.player2}
                                                    </span>
                                                    <span className="history-match-score-text">
                                                        Score: <span className="history-match-current-scores-text">{match.player1_score}</span> - <span className="history-match-current-scores-text">{match.player2_score}</span>
                                                    </span>
                                                </div>
                                            
                                                <div className="history-match-row-container">
                                                    <span></span>
                                                    <span className="history-match-button-container">
                                                        {match.winner === null && (
                                                            <button className="history-match-button continue" 
                                                            onClick={(e) => {e.stopPropagation(); continueStraightMatchPage(match)}}>
                                                                Continue Match
                                                            </button>
                                                        )}

                                                        <button className="history-match-button delete" 
                                                        onClick={(e) => {e.stopPropagation(); setShowDeleteStraightModal(true); setSelectedStraightMatch(match);}}>
                                                            Delete Match
                                                        </button>
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showSelectModal && (
                <div className="history-select-modal" onClick={() => setShowSelectModal(false)}>
                    <div className="history-select-modal-content" onClick={gameSelect}>
                        <div className="history-select-modal-close" onClick={() => setShowSelectModal(false)}>
                            &times;
                        </div>
                        <h2>Select a Game Type</h2>
                        <div className="history-select-game-options">
                            {["8 Ball", "9 Ball", "10 Ball", "Straight Pool (14.1 Continuous)"].map((game) => (
                                <button className="history-select-game-option" key={game} onClick={() => selectPage(game)}>
                                    {game}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showPoolDetailsModal && selectedPoolMatch && (
                <div className="history-details-modal" onClick={() => setShowPoolDetailsModal(false)}>
                    <div className="history-details-content" onClick={(e) => e.stopPropagation()}>
                        <div className="history-details-modal-close" onClick={() => setShowPoolDetailsModal(false)}>
                            &times;
                        </div>
                        <p className="history-details-game-type-text">
                            Game Type: {revGameTypeMap[selectedPoolMatch.game_type] ?? "None"}
                        </p>
                        <p className="history-details-game-name-text">
                            Game Name: {selectedPoolMatch.game_name}
                        </p>
                        <p className="history-details-player-names-text">
                            {selectedPoolMatch.player1} vs. {selectedPoolMatch.player2}
                        </p>
                        <p className="history-details-winner-text">
                            Lag Winner: {selectedPoolMatch.lag_winner}, Winner: {selectedPoolMatch.winner || "In Progress"}
                        </p>

                        <img src="/divider.png" className="divider-css"></img>

                        <p className="history-details-race-to-text">
                            Race to {selectedPoolMatch.race_to}
                            {selectedPoolMatch.pool_matches_sets?.sets !== null && selectedPoolMatch.pool_matches_sets?.sets !== undefined && (
                                <>, Best of {selectedPoolMatch.pool_matches_sets.sets}</>
                            )}
                        </p>
                        {selectedPoolMatch.pool_matches_sets?.sets != null ? (
                            <>
                                <p className="history-details-all-scores-text">All Scores:</p>
                                {selectedPoolMatch.pool_matches_race?.length > 0 && (
                                    <div className="history-details-sets-grid" style={{gridTemplateColumns: `repeat(${Math.min(selectedPoolMatch.pool_matches_race.length, 5)}, 1fr)`}}>
                                        {selectedPoolMatch.pool_matches_race.map((race, index) => (
                                            <p className="history-details-sets-scores-text" key={index}>
                                                Set {index + 1}: <span className="history-match-current-scores-text">{race.player1_score}</span> - <span className="history-match-current-scores-text">{race.player2_score}</span>
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="history-details-race-score-text">Score:</p>
                                {selectedPoolMatch.pool_matches_race?.[0] && (
                                    <p className="history-details-race-scores-text">
                                        {selectedPoolMatch.pool_matches_race[0].player1_score} - {selectedPoolMatch.pool_matches_race[0].player2_score}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {showDeletePoolModal && (
                <div className="history-delete-modal" onClick={() => {setShowDeletePoolModal(false)}}>
                    <div className="history-delete-modal-content" onClick={(e) => e.stopPropagation()}>
                        <p className="history-delete-warning-text">
                            Are you sure you want to delete this match?
                        </p>
                        <p className="history-delete-warning-text">
                            This action is irreversible!
                        </p>
                        <div className="history-delete-button-container">
                            <div className="history-delete-confirm-button" onClick={deletePoolMatch}>
                                Confirm Delete
                            </div>
                            <div className="history-delete-cancel-button" onClick={() => {setShowDeletePoolModal(false)}}>
                                Cancel
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showStraightDetailsModal && selectedStraightMatch && (
                <div className="history-details-modal" onClick={() => setShowStraightDetailsModal(false)}>
                    <div className="history-details-content" onClick={(e) => e.stopPropagation()}>
                        <p className="history-details-game-type-text">
                            Game Type: Straight Pool (14.1 Continuous)
                        </p>
                        <p className="history-details-game-name-text">
                            Game Name: {selectedStraightMatch.game_name}
                        </p>
                        <div className="history-details-player-names-container">
                            <p className="history-details-player-names-text">
                                {selectedStraightMatch.player1} vs. {selectedStraightMatch.player2}
                            </p>
                        </div>
                        <p className="history-details-winner-text">
                            Winner: {selectedStraightMatch.winner || "In Progress"}
                        </p>

                        <img src="/divider.png" className="divider-css"></img>

                        <p className="history-details-race-to-text">
                            Race to {selectedStraightMatch.race_to}
                        </p>
                        <p className="history-details-race-score-text">Score:</p>
                        <p className="history-details-race-scores-text">
                            {selectedStraightMatch.player1_score} - {selectedStraightMatch.player2_score}
                        </p>
                    </div>
                </div>
            )}
            
            {showDeleteStraightModal && (
                <div className="history-delete-modal" onClick={() => {setShowDeleteStraightModal(false)}}>
                    <div className="history-delete-modal-content" onClick={(e) => e.stopPropagation()}>
                        <p className="history-delete-warning-text">
                            Are you sure you want to delete this match?
                        </p>
                        <p className="history-delete-warning-text">
                            This action is irreversible!
                        </p>
                        <div className="history-delete-button-container">
                            <div className="history-delete-confirm-button" onClick={deleteStraightMatch}>
                                Confirm Delete
                            </div>
                            <div className="history-delete-cancel-button" onClick={() => {setShowDeleteStraightModal(false)}}>
                                Cancel
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
