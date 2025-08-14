"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import React, { useEffect, useState, useMemo, useRef } from 'react'
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
        winner: number | null;
        created_at: string;
        pool_matches_race: {
            player1_score: number;
            player2_score: number;
        }[];
        pool_matches_sets: {
            sets: number;
        }
        pool_matches_lag: {
            lag_winner: number;
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
        winner: number | null;
        created_at: string;
        straight_pool_matches_lag: {
            lag_winner: number;
        }
    }

    const allGameTypes = ['8-Ball', '9-Ball', '10-Ball', 'Straight Pool'];

    const gameTypeMap: Record<string, number | "Straight Pool"> = {
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
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const [showFilter, setShowFilter] = useState(false);
    const [filterTab, setFilterTab] = useState(1); //Filter tab selection
    const [prevTab, setPrevTab] = useState(1);
    const [transitioning, setTransitioning] = useState(false);
    const [slideDirection, setSlideDirection] = useState("right");

    const [selectedGameType, setSelectedGameType] = useState('');
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); //Sets a delay between new user search terms
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [playerName, setPlayerName] = useState("");
    const [debouncedPlayerName, setDebouncedPlayerName] = useState(playerName); //Sets a delay between new player name search terms
    const [winnerName, setWinnerName] = useState("");
    const [debouncedWinnerName, setDebouncedWinnerName] = useState(winnerName); //Sets a delay between new winner name search terms
    const [winnerPlayer, setWinnerPlayer] = useState("");
    const [raceTo, setRaceTo] = useState<number|null>(null);
    const [debouncedRaceTo, setDebouncedRaceTo] = useState<number|null>(raceTo); //Sets a delay between new race to search terms
    const [enableRaceToRange, setEnableRaceToRange] = useState(false);
    const [minRaceTo, setMinRaceTo] = useState<number|null>(null);
    const [maxRaceTo, setMaxRaceTo] = useState<number|null>(null);
    const [debouncedMinRaceTo, setDebouncedMinRaceTo] = useState<number|null>(minRaceTo); //Sets a delay between new min race to search terms
    const [debouncedMaxRaceTo, setDebouncedMaxRaceTo] = useState<number|null>(maxRaceTo); //Sets a delay between new max race to search terms
    const validateRaceToRangeTimeout = useRef<NodeJS.Timeout | null>(null); //Timer to set error if min < max
    const [sets, setSets] = useState<number|null>(null);
    const [debouncedSets, setDebouncedSets] = useState<number|null>(sets); //Sets a delay between new sets search terms
    const [enableSetsRange, setEnableSetsRange] = useState(false);
    const [minSets, setMinSets] = useState<number|null>(null);
    const [maxSets, setMaxSets] = useState<number|null>(null);
    const [debouncedMinSets, setDebouncedMinSets] = useState<number|null>(minSets); //Sets a delay between new min sets search terms
    const [debouncedMaxSets, setDebouncedMaxSets] = useState<number|null>(maxSets); //Sets a delay between new max sets to search terms
    const validateSetsRangeTimeout = useRef<NodeJS.Timeout | null>(null);

    const [raceToError, setRaceToError] = useState("");
    const [minMaxRaceToError, setMinMaxRaceToError] = useState("");
    const [raceToRangeError, setRaceToRangeError] = useState("");
    const [setsError, setSetsError] = useState("");
    const [minMaxSetsError, setMinMaxSetsError] = useState("");
    const [setsRangeError, setSetsRangeError] = useState("");

    const [allPoolMatches, setAllPoolMatches] = useState<PoolMatch[]>([]);
    const [allStraightMatches, setAllStraightMatches] = useState<StraightMatch[]>([]);
    const [showSelectModal, setShowSelectModal] = useState(false);

    const [selectedPoolMatch, setSelectedPoolMatch] = useState<PoolMatch>();
    const [selectedStraightMatch, setSelectedStraightMatch] = useState<StraightMatch>();
    const [showPoolDetailsModal, setShowPoolDetailsModal] = useState(false);
    const [showStraightDetailsModal, setShowStraightDetailsModal] = useState(false);
    const [showDeletePoolModal, setShowDeletePoolModal] = useState(false);
    const [showDeleteStraightModal, setShowDeleteStraightModal] = useState(false);

    const today = new Date().toLocaleDateString('en-CA');
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const handleTabChange = (tab: number) => {
        if (tab === filterTab) return;
        setSlideDirection(tab > filterTab ? "right" : "left");
        setPrevTab(filterTab);
        setTransitioning(true);

        setTimeout(() => {
            setFilterTab(tab);
            setTransitioning(false);
        }, 250);
    };

    const gameSelect = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
    }

    const selectPage = (selectedCreateGameType: string) => {
        if (selectedCreateGameType === "8-Ball"){
            router.push('/select/8-ball');
        }
        else if (selectedCreateGameType === "9-Ball"){
            router.push('/select/9-ball'); 
        }
        else if (selectedCreateGameType === "10-Ball"){
            router.push('/select/10-ball');
        }
        else if (selectedCreateGameType === "Straight Pool (14.1 Continuous)"){
            router.push('/select/straight-pool'); 
        }
    }

    const handleFilteredGameType = async (selectedFilteredGameType: string) => {
        if (selectedFilteredGameType === selectedGameType){
            setSelectedGameType('');
            return;
        }

        setSelectedGameType(selectedFilteredGameType);
    }

    const toggleRaceToFilter = () => {
        setEnableRaceToRange(!enableRaceToRange); 
        setRaceTo(null); 
        setMinRaceTo(null); 
        setMaxRaceTo(null);
        setRaceToError('');
        setRaceToRangeError('');
        setMinMaxRaceToError('');
    }

    const toggleSetsFilter = () => {
        setEnableSetsRange(!enableSetsRange); 
        setSets(null); 
        setMinSets(null); 
        setMaxSets(null);
        setSetsError('');
        setSetsRangeError('');
        setMinMaxSetsError('');
    }

    const handleRaceToFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (val === '') {
            setRaceTo(null);
            setRaceToError('');
            return;
        }

        if (!/^\d+$/.test(val)) {
            setRaceToError('Numeric inputs only.');
            return;
        }

        const num = Number(val);
        if (num >= 1 && num <= 500){
            setRaceTo(num);
            setRaceToError('');
        } 
        else{
            setRaceToError('Race to can only be between 1-500.');
        }
    }

    const handleMinRaceToFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (val === '') {
            setMinRaceTo(null);
            setMinMaxRaceToError('');
            return;
        }

        if (!/^\d+$/.test(val)) {
            setMinMaxRaceToError('Numeric inputs only.');
            return;
        }

        const num = Number(val);
        if (num >= 1 && num <= 500){
            setMinRaceTo(num);
            setMinMaxRaceToError('');
        } 
        else{
            setMinMaxRaceToError('Race to can only be between 1-500.');
            return;
        }
    }

    const handleMaxRaceToFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (val === '') {
            setMaxRaceTo(null);
            setMinMaxRaceToError('');
            return;
        }

        if (!/^\d+$/.test(val)) {
            setMinMaxRaceToError('Numeric inputs only.');
            return;
        }

        const num = Number(val);
        if (num >= 1 && num <= 500){
            setMaxRaceTo(num);
            setMinMaxRaceToError('');
        } 
        else{
            setMinMaxRaceToError('Race to can only be between 1-500.');
            return;
        }
    }

    const validateRaceToRange = (min: number | null, max: number | null) => {
        if (min !== null && max !== null && min > max){
            setRaceToRangeError('Minimum cannot be greater than Maximum.');
        } 
        else{
            setRaceToRangeError('');
        }
    };

    const handleSetsFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (val === '') {
            setSets(null);
            setSetsError('');
            return;
        }

        if (!/^[0-9]*$/.test(val)) {
            setSetsError('Numeric inputs only.');
            return;
        }

        const num = Number(val);

        if(num >= 1 && num <= 99 && num % 2 === 1) {
            setSets(num);
            setSetsError('');
        } 
        else{
            setSetsError('Sets can only be an odd input between 1-99.');
        }
    }

    const handleMinSetsFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (val === '') {
            setMinSets(null);
            setMinMaxSetsError('');
            return;
        }

        if (!/^\d+$/.test(val)) {
            setMinMaxSetsError('Numeric inputs only.');
            return;
        }

        const num = Number(val);
        if (num >= 1 && num <= 500){
            setMinSets(num);
            setMinMaxSetsError('');
        } 
        else{
            setMinMaxSetsError('Race to can only be between 1-500.');
            return;
        }
    }

    const handleMaxSetsFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (val === '') {
            setMaxSets(null);
            setMinMaxSetsError('');
            return;
        }

        if (!/^\d+$/.test(val)) {
            setMinMaxSetsError('Numeric inputs only.');
            return;
        }

        const num = Number(val);
        if (num >= 1 && num <= 500){
            setMaxSets(num);
            setMinMaxSetsError('');
        } 
        else{
            setMinMaxSetsError('Race to can only be between 1-500.');
            return;
        }
    }

    const validateSetsRange = (min: number | null, max: number | null) => {
        if (min !== null && max !== null && min > max){
            setSetsRangeError('Minimum cannot be greater than Maximum.');
        } 
        else{
            setSetsRangeError('');
        }
    };

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

    const availableGameTypes = useMemo(() => { //Returning all game types user has created
        const types = new Set<string>();

        allPoolMatches.forEach(match => {
            const gameTypeStr = revGameTypeMap[match.game_type];
            if (gameTypeStr) types.add(gameTypeStr);
        });

        if (allStraightMatches.length > 0) {
            types.add('Straight Pool');
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

    const filteredMatches = useMemo(() => { //Filtering games based on selected filters
        const gameNameSearch = debouncedSearchTerm.toLowerCase();
        const playerNameSearch = debouncedPlayerName.toLowerCase();
        const winnerNameSearch = debouncedWinnerName.toLowerCase();
    
        const filterByDate = (createdAt: string) => {   
            const date = new Date(createdAt);
            const matchDate = date.toLocaleDateString("en-CA");
            if (startDate && matchDate < startDate) return false;
            if (endDate && matchDate > endDate) return false;
            return true;
        };

        const filterByRaceTo = (matchRaceTo: number) => {
            return debouncedRaceTo == null || debouncedRaceTo === matchRaceTo;
        }

        const filterBySets = (matchSets: number) => {
            return debouncedSets == null || debouncedSets === matchSets;
        }

        const filterByRaceToRange = (matchRaceTo: number) => {
            return (
                (debouncedMinRaceTo == null || matchRaceTo >= debouncedMinRaceTo) &&
                (debouncedMaxRaceTo == null || matchRaceTo <= debouncedMaxRaceTo)
            );
        }

        const filterBySetsRange = (matchSets: number) => {
            return (
                (debouncedMinSets == null || matchSets >= debouncedMinSets) &&
                (debouncedMaxSets == null || matchSets <= debouncedMaxSets)
            );
        }

        const filterSetsActive = debouncedSets != null || debouncedMinSets != null || debouncedMaxSets != null;

        if (selectedGameType === ''){ //No filters on game type, display all matches      
            const poolMatchesWithType: (PoolMatch & { type: 'Pool' })[] = allPoolMatches.map(m => ({
                ...m,
                type: 'Pool' as const
            }));

            const straightMatchesWithType: (StraightMatch & { type: 'Straight Pool' })[] = allStraightMatches.map(m => ({
                ...m,
                type: 'Straight Pool' as const
            }));

            return [...poolMatchesWithType, ...straightMatchesWithType]
            .filter((match) => {
                return (
                    match.game_name.toLowerCase().includes(gameNameSearch) &&
                    filterByDate(match.created_at) &&
                    (
                        match.player1.toLowerCase().includes(playerNameSearch.toLowerCase()) ||
                        match.player2.toLowerCase().includes(playerNameSearch.toLowerCase())
                    ) &&
                    (
                        winnerPlayer === '' ||
                        (winnerPlayer === 'player1' && match.winner === 1) ||
                        (winnerPlayer === 'player2' && match.winner === 2)
                    ) &&
                    (
                        winnerNameSearch.trim() === '' ||
                        (match.winner === 1 && match.player1.toLowerCase().includes(winnerNameSearch.toLowerCase())) ||
                        (match.winner === 2 && match.player2.toLowerCase().includes(winnerNameSearch.toLowerCase()))
                    ) &&
                    filterByRaceTo(match.race_to) &&
                    filterByRaceToRange(match.race_to) &&
                    (match.type === 'Pool'
                        ? filterBySets(match.pool_matches_sets?.sets) &&
                        filterBySetsRange(match.pool_matches_sets?.sets)
                        : !filterSetsActive
                    )
                );
            })
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        if (selectedGameType === "Straight Pool"){ //Filtering straight pool game type
            return allStraightMatches
            .filter((match) => 
                match.game_name.toLowerCase().includes(gameNameSearch) && 
                filterByDate(match.created_at) &&
                (
                    match.player1.toLowerCase().includes(playerNameSearch.toLowerCase()) || 
                    match.player2.toLowerCase().includes(playerNameSearch.toLowerCase())
                ) && 
                (
                    winnerPlayer === '' ||
                    (winnerPlayer === 'player1' && match.winner === 1) ||
                    (winnerPlayer === 'player2' && match.winner === 2)
                ) &&
                (
                    winnerNameSearch.trim() === '' ||
                    (match.winner === 1 && match.player1.toLowerCase().includes(winnerNameSearch.toLowerCase())) ||
                    (match.winner === 2 && match.player2.toLowerCase().includes(winnerNameSearch.toLowerCase()))
                ) && 
                filterByRaceTo(match.race_to) &&
                filterByRaceToRange(match.race_to)
            )
            .map((match) => ({
                ...match,
                type: "Straight Pool" as const
            }));
        }

        const selected = gameTypeMap[selectedGameType]; //Filtering pool games (8/9/10 Ball) game type
        return allPoolMatches
        .filter((match) => 
            match.game_type === selected && 
            match.game_name.toLowerCase().includes(gameNameSearch) && 
            filterByDate(match.created_at) &&
            (
                match.player1.toLowerCase().includes(playerNameSearch.toLowerCase()) || 
                match.player2.toLowerCase().includes(playerNameSearch.toLowerCase())
            ) &&
            (
                winnerPlayer === '' ||
                (winnerPlayer === 'player1' && match.winner === 1) ||
                (winnerPlayer === 'player2' && match.winner === 2)
            ) &&
            (
                winnerNameSearch.trim() === '' ||
                (match.winner === 1 && match.player1.toLowerCase().includes(winnerNameSearch.toLowerCase())) ||
                (match.winner === 2 && match.player2.toLowerCase().includes(winnerNameSearch.toLowerCase()))
            ) && 
            filterByRaceTo(match.race_to) &&
            filterByRaceToRange(match.race_to) &&
            filterBySets(match.pool_matches_sets?.sets) &&
            filterBySetsRange(match.pool_matches_sets?.sets)
        )
        .map((match) => ({
            ...match,
            type: "Pool" as const
        }));
    }, [allPoolMatches, allStraightMatches, selectedGameType, debouncedSearchTerm, startDate, endDate, 
        debouncedPlayerName, debouncedWinnerName, winnerPlayer, debouncedRaceTo, debouncedSets, 
        debouncedMinRaceTo, debouncedMaxRaceTo, debouncedMinSets, debouncedMaxSets]);

    const handleClearFilters = () => { //Clear all filters
        setSelectedGameType('');
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setPlayerName('');
        setWinnerName('');
        setWinnerPlayer('');
        setRaceTo(null);
        setMinRaceTo(null);
        setMaxRaceTo(null);
        setSets(null);
        setMinSets(null);
        setMaxSets(null);

        setFilterTab(1);
    };

    useEffect(() => { //Get all matches
        const fetchAllMatches = async () => {
            setLoading(true);

            try{
                const res = await fetch('/api/getHistoryMatches');
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

    useEffect(() => { //Set a timeout to search winner name
        if (winnerName === "") {
            setDebouncedWinnerName("");
            return;
        }

        const handler = setTimeout(() => {
            setDebouncedWinnerName(winnerName);
        }, 300);

        return () => clearTimeout(handler);
    }, [winnerName]);

    useEffect(() => { //Set a timeout to search race to
        if (raceTo === null) {
            setDebouncedRaceTo(null);
            return;
        }

        const handler = setTimeout(() => {
            setDebouncedRaceTo(raceTo);
        }, 300);

        return () => clearTimeout(handler);
    }, [raceTo]);

    useEffect(() => { //Set a timeout to search min race to
        if (minRaceTo === null) {
            setDebouncedMinRaceTo(null);
            return;
        }

        const handler = setTimeout(() => {
            setDebouncedMinRaceTo(minRaceTo);
        }, 500);

        return () => clearTimeout(handler);
    }, [minRaceTo]);

    useEffect(() => { //Set a timeout to search max race to
        if (maxRaceTo === null) {
            setDebouncedMaxRaceTo(null);
            return;
        }

        const handler = setTimeout(() => {
            setDebouncedMaxRaceTo(maxRaceTo);
        }, 500);

        return () => clearTimeout(handler);
    }, [maxRaceTo]);

    useEffect(() => { //Set a timeout to search sets
        if (sets === null) {
            setDebouncedSets(null);
            return;
        }

        const handler = setTimeout(() => {
            setDebouncedSets(sets);
        }, 300);

        return () => clearTimeout(handler);
    }, [sets]);

    useEffect(() => { //Set a timeout to search min sets
        if (minSets === null) {
            setDebouncedMinSets(null);
            return;
        }

        const handler = setTimeout(() => {
            setDebouncedMinSets(minSets);
        }, 500);

        return () => clearTimeout(handler);
    }, [minSets]);

    useEffect(() => { //Set a timeout to search max sets
        if (maxSets === null) {
            setDebouncedMaxSets(null);
            return;
        }

        const handler = setTimeout(() => {
            setDebouncedMaxSets(maxSets);
        }, 500);

        return () => clearTimeout(handler);
    }, [maxSets]);

    useEffect(() => { //Set a timeout to validate range in race to
        if (validateRaceToRangeTimeout.current){
            clearTimeout(validateRaceToRangeTimeout.current);
        }

        validateRaceToRangeTimeout.current = setTimeout(() => {
            validateRaceToRange(minRaceTo, maxRaceTo);
        }, 1000);

        return () => {
            if (validateRaceToRangeTimeout.current){
                clearTimeout(validateRaceToRangeTimeout.current);
            }
        };
    }, [minRaceTo, maxRaceTo]);

    useEffect(() => { //Set a timeout to validate range in sets
        if (validateSetsRangeTimeout.current){
            clearTimeout(validateSetsRangeTimeout.current);
        }

        validateSetsRangeTimeout.current = setTimeout(() => {
            validateSetsRange(minSets, maxSets);
        }, 1000);

        return () => {
            if (validateSetsRangeTimeout.current){
                clearTimeout(validateSetsRangeTimeout.current);
            }
        };
    }, [minSets, maxSets]);

    useEffect(() => { //Toastify notification on password resetted successfully
        if (loading) return;

        const success = searchParams.get('success');
        if (success === '1') {
            setTimeout(() => {
                toast.success("Password resetted successfully.", {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            }, 0);

            const params = new URLSearchParams(searchParams.toString());
            params.delete('success');
            router.replace(`${pathname}?${params.toString()}`);
        }
    }, [loading]);

    if (loading){
        return <Loading/>;
    }

    return (
        <div className="history-page-container">
            <ToastContainer className="history-toast"/>
            <div className={`history-container ${showSelectModal ? "blurred" : ""}`}>
                <div className="history-new-game-container">
                    <button 
                        className="hamburger-button" 
                        onClick={() => setShowFilter(!showFilter)}
                    >
                        ☰
                    </button>
                    <button className="history-new-game-button" onClick={() => setShowSelectModal(true)}>+ New Game</button>
                </div>
                
                <div className="history-content-container">
                    <div className="history-filter-container">
                        <div className="history-filter-tabs">
                            <button 
                                className={`history-filter-tab ${filterTab === 1 ? "active" : ""}`}
                                onClick={() => handleTabChange(1)}
                            >
                                Game Type
                            </button>
                            <button 
                                className={`history-filter-tab ${filterTab === 2 ? "active" : ""}`}
                                onClick={() => handleTabChange(2)}
                            >
                                General
                            </button>
                            <button 
                                className={`history-filter-tab ${filterTab === 3 ? "active" : ""}`}
                                onClick={() => handleTabChange(3)}
                            >
                                Advanced
                            </button>
                        </div>

                        <div className={`history-filter-tab-content 
                            ${transitioning 
                                ? slideDirection === "right" 
                                    ? "slide-out-left" 
                                    : "slide-out-right"
                                : slideDirection === "right" 
                                    ? "slide-in-right slide-active" 
                                    : "slide-in-left slide-active"
                            }`}>

                            {filterTab === 1 && (
                                <>
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
                                                    className={`history-filter-game-button ${selectedGameType === type ? 'active' : ''} ${type === 'Straight Pool' ? 'smaller-font' : ''}`}
                                                    onClick={() => {handleFilteredGameType(type)}}
                                                    >
                                                    {type === 'Straight Pool' ? <>Straight Pool <br /> (14.1 Continuous)</> : type}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {filterTab === 2 && (
                                <>
                                    <p>Search game name:</p>
                                    <div className="history-search-container">
                                        <span className="history-search-icon">🔍</span>
                                        <input className="history-search-input" placeholder="Search game name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                                    </div>

                                    <p>Filter by date:</p>
                                    <div className="history-date-container">
                                        <input type="date" className="history-date-input" placeholder="Start date" value={startDate} min={earliestMatchDate} max={endDate || today} 
                                        onChange={(e) => setStartDate(e.target.value)}/>

                                        <input type="date" className="history-date-input" placeholder="End date" value={endDate} min={earliestMatchDate || startDate} max={today}
                                        onChange={(e) => setEndDate(e.target.value)}/>
                                    </div>

                                    <p>Filter by player name:</p>
                                    <div className="history-search-container">
                                        <span className="history-search-icon">🔍</span>
                                        <input className="history-search-input" placeholder="Search player name" value={playerName} onChange={(e) => setPlayerName(e.target.value)}/>
                                    </div>

                                    <p>Filter by winner name:</p>
                                    <div className="history-search-container">
                                        <span className="history-search-icon">🔍</span>
                                        <input className="history-search-input" placeholder="Search winner name" value={winnerName} onChange={(e) => setWinnerName(e.target.value)}/>
                                    </div>
                                </>
                            )}
                            
                            {filterTab === 3 && (
                                <>        
                                    <p>Filter by player win:</p>
                                    <div className="history-filter-grid">
                                        <button className={`history-filter-game-button ${winnerPlayer === 'player1' ? 'active' : ''}`} 
                                        onClick={() => setWinnerPlayer(winnerPlayer === 'player1' ? '' : 'player1')}>
                                            Player 1 Wins
                                        </button>
                                        <button className={`history-filter-game-button ${winnerPlayer === 'player2' ? 'active' : ''}`} 
                                        onClick={() => setWinnerPlayer(winnerPlayer === 'player2' ? '' : 'player2')}>
                                            Player 2 Wins
                                        </button>
                                    </div>
                                    
                                    <p>Filter by race to:</p>

                                    <div className="history-search-number-container">
                                        {!enableRaceToRange ? (
                                            <>
                                                <input
                                                    className="history-search-input number-input"
                                                    placeholder="Search race to"
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={raceTo ?? ''}
                                                    onChange={handleRaceToFilter}
                                                />
                                                {raceToError && <p className="history-race-to-error">{raceToError}</p>}
                                            </>
                                        ) : (
                                            <>
                                                <div className="history-range-container">
                                                    <input
                                                        className="history-search-input number-input"
                                                        placeholder="Min race to"
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={minRaceTo ?? ''}
                                                        onChange={handleMinRaceToFilter}
                                                    />
                                                    
                                                    <p>To</p>

                                                    <input
                                                        className="history-search-input number-input"
                                                        placeholder="Max race to"
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={maxRaceTo ?? ''}
                                                        onChange={handleMaxRaceToFilter}
                                                    />
                                                </div>
                                                {minMaxRaceToError && <p className="history-race-to-error">{minMaxRaceToError}</p>}
                                                {raceToRangeError && <p className="history-race-to-error">{raceToRangeError}</p>}   
                                            </>
                                        )}
                                    </div>

                                    <label className="history-filter-toggle-container">
                                        <input type="checkbox" checked={enableRaceToRange} onChange={toggleRaceToFilter}/>
                                        <span className="history-filter-slider"></span>
                                        <span className="history-filter-toggle-label">
                                            {enableRaceToRange ? "Disable Race Range" : "Enable Race Range"}
                                        </span>
                                    </label>
                                    
                                    <p>Filter by sets:</p>

                                    {selectedGameType != "Straight Pool" && (
                                        <>
                                            <div className="history-search-number-container">
                                                {!enableSetsRange ? (
                                                    <>
                                                        <input
                                                            className="history-search-input number-input"
                                                            placeholder="Search sets"
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={sets ?? ''}
                                                            onChange={handleSetsFilter}
                                                        />
                                                        {setsError && <p className="history-race-to-error">{setsError}</p>}
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="history-range-container">
                                                            <input
                                                                className="history-search-input number-input"
                                                                placeholder="Min sets"
                                                                type="text"
                                                                inputMode="numeric"
                                                                value={minSets ?? ''}
                                                                onChange={handleMinSetsFilter}
                                                            />
                                                            

                                                            <p>To</p>

                                                            <input
                                                                className="history-search-input number-input"
                                                                placeholder="Max sets"
                                                                type="text"
                                                                inputMode="numeric"
                                                                value={maxSets ?? ''}
                                                                onChange={handleMaxSetsFilter}
                                                            />
                                                            
                                                        </div>
                                                        {minMaxRaceToError && <p className="history-race-to-error">{minMaxSetsError}</p>}
                                                        {setsRangeError && <p className="history-race-to-error">{setsRangeError}</p>}
                                                    </>
                                                )}
                                            </div>

                                            <label className="history-filter-toggle-container">
                                                <input type="checkbox" checked={enableSetsRange} onChange={toggleSetsFilter}/>
                                                <span className="history-filter-slider"></span>
                                                <span className="history-filter-toggle-label">
                                                    {enableSetsRange ? "Disable Sets Range" : "Enable Sets Range"}
                                                </span>
                                            </label>
                                        </>
                                    )}
                                </>
                            )}    
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
                                        {selectedGameType === '' ? 'All' : selectedGameType === 'Straight Pool'                                                                                                                
                                            ? 'Straight Pool (14.1 Continuous)'
                                            : revGameTypeMap[parseInt(selectedGameType)] ?? selectedGameType } Matches
                                    </span>                                                                                         
                                    <span className="history-matches-count">
                                        {filteredMatches.length} match{filteredMatches.length !== 1 && 'es'} found
                                    </span>
                                </div>
                                {filteredMatches.map((match) => {
                                    if (match.type === "Pool"){
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
                                                    <span className="history-match-game-name-text">{match.game_name}</span>
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
                                    else if (match.type === 'Straight Pool'){
                                        return (
                                            <div key={match.match_id} className="history-match-container" onClick={() => {setShowStraightDetailsModal(true); setSelectedStraightMatch(match);}}>
                                                <div className="history-match-row-container">
                                                    <span className="history-match-game-name-text">{match.game_name}</span>
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
                            {["8-Ball", "9-Ball", "10-Ball", "Straight Pool (14.1 Continuous)"].map((game) => (
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
                            {selectedPoolMatch.pool_matches_lag?.lag_winner != null && (
                                <>
                                    Lag Winner:{" "}
                                    {selectedPoolMatch.pool_matches_lag.lag_winner === 1
                                        ? selectedPoolMatch.player1 === "Player1"
                                            ? "Player 1"
                                            : `Player 1 - ${selectedPoolMatch.player1}`
                                        : selectedPoolMatch.pool_matches_lag.lag_winner === 2
                                        ? selectedPoolMatch.player2 === "Player2"
                                            ? "Player 2"
                                            : `Player 2 - ${selectedPoolMatch.player2}`
                                        : "Unknown"}
                                    ,{" "}
                                </>
                            )}
                            Winner:{" "}
                            {selectedPoolMatch.winner === 1
                                ? selectedPoolMatch.player1 === "Player1"
                                    ? "Player 1"
                                    : `Player 1 - ${selectedPoolMatch.player1}`
                                : selectedPoolMatch.winner === 2
                                ? selectedPoolMatch.player2 === "Player2"
                                    ? "Player 2"
                                    : `Player 2 - ${selectedPoolMatch.player2}`
                                : "In Progress"}
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

                        <div className="history-details-buttons-container">
                            {selectedPoolMatch.winner === null && (
                                <button className="history-match-button continue" 
                                onClick={(e) => {e.stopPropagation(); continuePoolMatchPage(selectedPoolMatch);}}>
                                    Continue Match
                                </button>
                            )}

                            <button className="history-match-button delete" 
                            onClick={(e) => {e.stopPropagation(); setShowDeletePoolModal(true); setSelectedPoolMatch(selectedPoolMatch);}}>
                                Delete Match
                            </button>
                        </div>
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
                            {selectedStraightMatch.straight_pool_matches_lag?.lag_winner != null && (
                                <>
                                    Lag Winner:{" "}
                                    {selectedStraightMatch.straight_pool_matches_lag.lag_winner === 1
                                        ? selectedStraightMatch.player1 === "Player1"
                                            ? "Player 1"
                                            : `Player 1 - ${selectedStraightMatch.player1}`
                                        : selectedStraightMatch.straight_pool_matches_lag.lag_winner === 2
                                        ? selectedStraightMatch.player2 === "Player2"
                                            ? "Player 2"
                                            : `Player 2 - ${selectedStraightMatch.player2}`
                                        : "Unknown"}
                                    ,{" "}
                                </>
                            )}
                            Winner:{" "}
                            {selectedStraightMatch.winner === 1
                                ? selectedStraightMatch.player1 === "Player1"
                                    ? "Player 1"
                                    : `Player 1 - ${selectedStraightMatch.player1}`
                                : selectedStraightMatch.winner === 2
                                ? selectedStraightMatch.player2 === "Player2"
                                    ? "Player 2"
                                    : `Player 2 - ${selectedStraightMatch.player2}`
                                : "In Progress"}
                        </p>



                        <img src="/divider.png" className="divider-css"></img>

                        <p className="history-details-race-to-text">
                            Race to {selectedStraightMatch.race_to}
                        </p>
                        <p className="history-details-race-score-text">Score:</p>
                        <p className="history-details-race-scores-text">
                            {selectedStraightMatch.player1_score} - {selectedStraightMatch.player2_score}
                        </p>

                        <div>
                            {selectedStraightMatch.winner === null && (
                                <button className="history-match-button continue" 
                                onClick={(e) => {e.stopPropagation(); continueStraightMatchPage(selectedStraightMatch);}}>
                                    Continue Match
                                </button>
                            )}

                            <button className="history-match-button delete" 
                            onClick={(e) => {e.stopPropagation(); setShowDeletePoolModal(true); setSelectedStraightMatch(selectedStraightMatch);}}>
                                Delete Match
                            </button>
                        </div>
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
