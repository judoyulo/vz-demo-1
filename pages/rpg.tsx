import React, { useState, useEffect, useReducer, useRef, CSSProperties } from 'react';
import { useRouter } from 'next/router';
import GlobalNav from '../components/GlobalNav';
import {
  getPageContainerStyle,
  getMainContainerStyle,
  getTitleStyle,
  getButtonStyle,
} from '../utils/layoutConfig';
import { aiService, BotProfile, Action, SideMission, FinalChoiceOption } from '../lib/aiService';
import { MOCK_USERS } from '../data/mockUsers';
import { UserProfile } from '../types';

// --- Constants ---
const MAX_MESSAGES_PER_ROUND = 5;
const MAX_VOICE_CLIP_SECONDS = 15;


// --- Types ---
type PlayerProfile = { background: string; socialRole: string; personality: string[] | string; };
type MissionData = { secretBackstory: string; mainMission: string; };
type GamePhase = 'chat' | 'selectAction' | 'finalDecision' | 'result';
type Message = {
    senderId: 'player1' | 'player2' | 'system';
    content: string; // For voice, this is the dataUrl
    type: 'text' | 'voice' | 'system';
    round: number;
    timestamp: number;
    senderName: string;
    transcribedText?: string;
};
type GameState = {
    round: number;
    maxRounds: number;
    currentPhase: GamePhase;
    chatLog: Message[];
    selectedActions: { [key: string]: string | null };
    sideMissions: { player1: SideMission[]; player2: SideMission[]; };
    mainMissionSuccess: boolean;
    finalScore: FinalScore | null;
    isScoring: boolean;
};
type FinalScore = {
    mainMission: boolean;
    sideMissions: number;
    performance: number;
    totalScore: number;
    endingText: string;
    title: string;
};

// --- Game Content & Helpers ---
const STORY_BACKGROUND = "You open your eyes to find yourself in a stationary elevator, the kind with polished mahogany walls and a faint, unsettling smell of ozone. The only other person here is a stranger, looking just as confused as you are. As your memory returns, you recall your mission. The elevator dings softly, but the doors remain shut. A disembodied voice announces, 'The test begins now. Convince your partner to press their button first. Only one of you may proceed.' You both notice two large, unlabeled buttons on the control panel, one on each side.";
const MISSIONS: Record<string, MissionData> = {
    "Orphaned Young": { secretBackstory: "You were framed for your parents' death, a messy affair involving corporate espionage between two rival zaibatsus. You've spent years in the underworld, and this meeting is your one chance to get close to a high-level operative from the rival company. Your contact is known to be cautious and ruthless.", mainMission: "Identify if your contact is from the rival zaibatsu by tricking them into revealing a piece of company-specific slang or protocol. Do not reveal your true purpose." },
    "Anime Pilgrim": { secretBackstory: "Your 'pilgrimage' to Akihabara is a cover. You're an agent for the 'Artistic Liberation Front,' a group that repatriates stolen art. Your target has a priceless artifact, and this elevator meeting was arranged to exchange it for a perfect forgery. The handoff code is hidden in a discussion about a specific classic anime.", mainMission: "Verify your contact has the authentic key phrase hidden in a conversation about 'Neon Genesis Evangelion.' If they are legitimate, they will respond correctly. If not, you must abort the mission." },
    "Alien Anthropologist": { secretBackstory: "You are an alien scientist, disguised as a human, studying this chaotic species. Your last mission ended in disaster when your partner, another disguised alien, went rogue and started selling advanced technology on the black market. The person in front of you is a known information broker who may have dealt with your ex-partner.", mainMission: "Probe your contact for knowledge of illegal alien tech sales without revealing your own non-human origins. You need a name or a location to continue your hunt." },
    "Lottery Winner": { secretBackstory: "You didn't just win money; you won the 'Temporal Lottery,' a one-way trip to a pivotal moment in your past to correct a single mistake. The elevator is your transport, but something is wrong. The other person here wasn't part of your memory. Are they another winner? A temporal agent? Or the mistake you were sent to fix?", mainMission: "Figure out if the other person is connected to the specific event in your past you came to change. You must not reveal that you are a time traveler." },
    "Amnesiac": { secretBackstory: "You woke up in a sterile room with no memory, only a splitting headache and a fresh tattoo on your palm that reads: 'DO NOT TRUST THE OTHER PERSON. IT IS A TEST. FIND THE KEY.' You were then escorted to this elevator. Every instinct screams that you are in mortal danger.", mainMission: "Discern the nature of the 'test' and locate a hidden exit protocol. The other person is part of the test; they may be an ally or an obstacle." },
    "Cult Survivor": { secretBackstory: "The 'self-help group' you escaped from wasn't about wellness; it was a front for a reality-bending entity that feeds on social conformity. They branded you as an apostate, and you've been on the run ever since. The person in front of you has the same vacant, overly serene look as the cult's 'enforcers.'", mainMission: "Confirm if the other person is a cult agent by using a coded phrase only a true member would recognize. If they are, you must find a way to neutralize them before they 're-educate' you." },
    "Former Child Star": { secretBackstory: "Your career peaked at age 12. Now, you're desperate for a comeback. This is a secret 'audition' with a notorious, eccentric underground director known for immersive, dangerous methods. The other person is your scene partner. The director is watching, and only the most convincing actor will get the role.", mainMission: "Impress the 'director' with your commitment to the role, even if it means psychologically dominating your scene partner. You must be the more memorable performer." },
    "Time Traveler's Intern": { secretBackstory: "A simple coffee run to 1999 to see a historic concert went wrong. Your temporal tether snapped, and you've been stuck here for what feels like years, trying to get a message to your boss in the future. The person in the elevator is your one chance, a temporal courier who can take a message back... for a price.", mainMission: "Identify the anachronistic object the other person is carrying—it's your proof they are a genuine time courier. Then, convince them to take your message without giving them anything they could use to exploit you." },
    "Default": { secretBackstory: "You are not who you seem. You have a mission, and the person in front of you is either your target or an obstacle. Your briefing was minimal: get them to act first, observe their choice, and report back. Failure is not an option.", mainMission: "Survive this meeting, ensure the other person acts first, and learn one critical piece of information about their identity or purpose." }
};
const ROUND_ACTIONS: Action[][] = [
    [ // Round 1
        { tag: 'emotion_mask', label: 'Mask your emotion', description: 'Adopt a neutral, unreadable expression.' },
        { tag: 'physical_approach', label: 'Subtly approach', description: 'Take a small, almost imperceptible step closer to them.' },
        { tag: 'explore_panel', label: 'Examine the control panel', description: 'Look for hidden seams or buttons near the main controls.' },
        { tag: 'question_surroundings', label: 'Question the surroundings', description: 'Ask aloud, "Where are we? What is this place?"' }
    ],
    [ // Round 2
        { tag: 'show_empathy', label: 'Show empathy', description: 'Offer a reassuring look, as if to say "we are in this together".' },
        { tag: 'interrupt', label: 'Interrupt them', description: 'Cut them off mid-sentence to seize control of the conversation.' },
        { tag: 'glance_at_button', label: 'Glance at their button', description: 'Let your eyes linger on their button for a moment too long.' },
        { tag: 'reveal_small_truth', label: 'Reveal a small, true detail', description: 'Share a minor, verifiable fact about your supposed identity.' }
    ],
    [ // Round 3
        { tag: 'make_accusation', label: 'Make an accusation', description: 'Point at them and state, "You did this!"' },
        { tag: 'physical_retreat', label: 'Create distance', description: 'Take a deliberate step back, increasing the space between you.' },
        { tag: 'explore_walls', label: 'Investigate the walls', description: 'Run your hands along the mahogany panels, searching for a weak spot.' },
        { tag: 'offer_sacrifice', label: 'Offer to sacrifice yourself', description: 'Claim you will press the button for their benefit, with a hidden agenda.' }
    ]
];
const FINAL_CHOICES: Record<string, FinalChoiceOption[]> = {
    "Orphaned Young": [
        { tag: 'accuse_zaibatsu', label: "Accuse them of being a 'Kuro-Taka' agent", outcome: "A direct accusation using a codename. If they react with recognition, your mission is a success.", success: true },
        { tag: 'offer_info_for_exit', label: "Offer them corporate secrets for a way out", outcome: "A bluff to see if their greed outweighs their training.", success: false },
    ],
    "Anime Pilgrim": [
        { tag: 'quote_eva', label: "Ask, 'Does the angel no longer sing for us?'", outcome: "The correct countersign. If they reply 'Only in the Sea of LCL,' the mission is a success.", success: true },
        { tag: 'draw_symbol', label: "Discreetly draw the NERV logo on your palm", outcome: "A visual cue. If they nod in understanding, your mission is complete.", success: false },
    ],
    "Default": [
        { tag: 'demand_identity', label: "Demand to know who they are", outcome: "A direct confrontation to force their hand.", success: true },
        { tag: 'press_button_now', label: "Press your button", outcome: "Take control of the experiment.", success: false },
    ]
};

const SIDE_MISSIONS_POOL: { targetActionTag: string; description: string }[] = [
    { targetActionTag: 'physical_approach', description: 'Induce your opponent to move closer to you.' },
    { targetActionTag: 'reveal_small_truth', description: 'Induce your opponent to reveal a small truth about themselves.' },
    { targetActionTag: 'make_accusation', description: 'Induce your opponent to make an accusation against you.' },
];
const assignSideMission = (round: number): SideMission => {
    const mission = SIDE_MISSIONS_POOL[Math.floor(Math.random() * SIDE_MISSIONS_POOL.length)];
    return { ...mission, round, success: false };
};

// --- Reducer and State ---
const getInitialState = (): GameState => ({
    round: 1,
    maxRounds: 3,
    currentPhase: 'chat',
    chatLog: [],
    selectedActions: { player1: null, player2: null },
    sideMissions: {
        player1: [assignSideMission(1)],
        player2: [assignSideMission(1)],
    },
    mainMissionSuccess: false,
    finalScore: null,
    isScoring: false,
});

function gameReducer(state: GameState, action: { type: string, payload?: any }): GameState {
    switch (action.type) {
        case 'LOAD_STATE':
            return action.payload;
        case 'ADD_MESSAGE':
            return { ...state, chatLog: [...state.chatLog, action.payload] };
        case 'SELECT_ACTION':
            return { ...state, selectedActions: { ...state.selectedActions, [action.payload.playerId]: action.payload.actionTag }};
        case 'ADVANCE_ROUND':
            return {
                ...state,
                round: state.round + 1,
                currentPhase: 'chat',
                sideMissions: {
                    player1: [...state.sideMissions.player1, assignSideMission(state.round + 1)],
                    player2: [...state.sideMissions.player2, assignSideMission(state.round + 1)],
                },
            };
        case 'COMPLETE_SIDE_MISSION':
             const { player }: { player: 'player1' | 'player2' } = action.payload;
            return {
                ...state,
                sideMissions: {
                    ...state.sideMissions,
                    [player]: state.sideMissions[player].map((m: SideMission) => m.round === action.payload.round ? { ...m, success: true } : m)
                }
            };
        case 'SET_PHASE':
            return { ...state, currentPhase: action.payload, selectedActions: { player1: null, player2: null } };
        case 'SET_MAIN_MISSION_SUCCESS':
            return { ...state, mainMissionSuccess: action.payload };
        case 'START_SCORING':
            return { ...state, isScoring: true, currentPhase: 'result' };
        case 'SET_FINAL_SCORE':
            return { ...state, finalScore: action.payload, isScoring: false };
        case 'RESET_GAME':
            localStorage.removeItem('gameState');
            return getInitialState();
        default:
            return state;
    }
}

// --- UI Components ---
const RPGGameGuide: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div style={{ marginBottom: '20px' }}>
            <button 
                className="rpg-guide-toggle"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                🧩 {isExpanded ? 'Hide' : 'Show'} RPG Game Guide
            </button>
            
            {isExpanded && (
                <div className="rpg-guide-card">
                    <h3>🎮 Welcome to VerseZ 1-on-1 RPG Session</h3>
                    <p>
                        In this interactive roleplay, you and your opponent each step into a custom persona with unique backgrounds, personalities, and secret goals. Use your words, choices, and actions to shape the story—and uncover the truth.
                    </p>

                    <h4>💡 How it works:</h4>
                    <ul>
                        <li>
                            <strong>You will receive a secret profile</strong> with:
                            <ul>
                                <li>A shared background scene</li>
                                <li>A unique personal backstory</li>
                                <li>A <strong>Main Mission</strong> (your final goal)</li>
                                <li>A <strong>Side Quest</strong> (changes each round)</li>
                            </ul>
                        </li>
                        <li>
                            <strong>You will chat with your opponent</strong>
                            <ul>
                                <li>Use up to 5 text or voice messages per round</li>
                                <li>Try to roleplay, manipulate, or deduce—your choice</li>
                            </ul>
                        </li>
                        <li>
                            <strong>After each round</strong>, choose an action
                            <ul>
                                <li>Your choice affects your side quest and story direction</li>
                                <li>You'll receive a new side quest in the next round</li>
                            </ul>
                        </li>
                        <li>
                            <strong>After 3 rounds</strong>, make your <strong>Final Decision</strong>
                            <ul>
                                <li>This will determine your Main Mission score</li>
                            </ul>
                        </li>
                        <li>
                            <strong>At the end</strong>, your performance will be scored based on:
                            <ul>
                                <li>🎯 Mission completion (Main & Side)</li>
                                <li>🎭 Roleplaying and expression</li>
                            </ul>
                        </li>
                    </ul>

                    <h4>🎯 Goal:</h4>
                    <p>
                        Perform your character well, uncover your opponent's motives, and complete your missions—while staying in character.
                    </p>
                </div>
            )}
        </div>
    );
};

const AudioPlayer = ({ src, context = 'chat' }: { src: string, context?: 'chat' | 'preview' }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        }
    };
    
    useEffect(() => {
        const audioEl = audioRef.current;
        if (!audioEl) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);

        audioEl.addEventListener('play', handlePlay);
        audioEl.addEventListener('pause', handlePause);
        audioEl.addEventListener('ended', handleEnded);

        return () => {
            audioEl.removeEventListener('play', handlePlay);
            audioEl.removeEventListener('pause', handlePause);
            audioEl.removeEventListener('ended', handleEnded);
        };
    }, []);

    if (context === 'preview') {
        return (
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '10px' }}>
                <audio ref={audioRef} src={src} preload="none" style={{ display: 'none' }}></audio>
                <button onClick={togglePlay} style={{background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer'}}>
                    {isPlaying ? '❚❚' : '▶'}
                </button>
                <span style={{color: '#E0E0E0', fontSize: '14px'}}>Voice Clip</span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <audio ref={audioRef} src={src} preload="none" style={{ display: 'none' }}></audio>
            <button onClick={togglePlay} style={{background: 'none', border: '1px solid #fff', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isPlaying ? '❚❚' : '▶'}
            </button>
            <span style={{color: '#E0E0E0', fontSize: '14px'}}>Voice Message</span>
        </div>
    );
};

const OpponentProfileCard = ({ opponentProfile }: { opponentProfile: UserProfile | null }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    if (!opponentProfile) return null;
    return (
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px', cursor: 'pointer' }} onClick={() => setIsExpanded(!isExpanded)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ marginTop: '0', color: '#fff' }}>🤖 Opponent’s Role</h3>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{isExpanded ? '▲ Collapse' : '▼ Expand'}</span>
            </div>
            {isExpanded && (
                <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '14px', color: '#b0b8d0', margin: '4px 0' }}><strong>🧠 Background:</strong> {opponentProfile.role.background}</p>
                    <p style={{ fontSize: '14px', color: '#b0b8d0', margin: '4px 0' }}><strong>💼 Social Role:</strong> {opponentProfile.role.socialRole}</p>
                    <p style={{ fontSize: '14px', color: '#b0b8d0', margin: '4px 0' }}><strong>🌀 Personality:</strong> {Array.isArray(opponentProfile.role.personality) ? opponentProfile.role.personality.join(', ') : opponentProfile.role.personality}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '10px', fontStyle: 'italic' }}>This information is for your reference only. Their true purpose may be hidden...</p>
                </div>
            )}
        </div>
    );
};

const ScriptLoader = ({ story, playerProfile, mission }: { story: string, playerProfile: PlayerProfile, mission: MissionData | null }) => {
    const [showSecret, setShowSecret] = useState(false);
    if (!playerProfile || !mission) return <p>Loading player data...</p>;
    const personality = Array.isArray(playerProfile.personality) ? playerProfile.personality.join(', ') : playerProfile.personality;
    return (
      <div style={{ marginBottom: '20px' }}>
        <div style={{ padding: '20px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', color: '#fff' }}>📜 Story Background</h2>
          <p style={{ fontSize: '15px', color: '#E0E0E0', lineHeight: '1.6' }}>{story}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ marginTop: '0', color: '#fff' }}>Your Role</h3>
            <p style={{ fontSize: '14px', color: '#b0b8d0', margin: '4px 0' }}><strong>Background:</strong> {playerProfile.background}</p>
            <p style={{ fontSize: '14px', color: '#b0b8d0', margin: '4px 0' }}><strong>Social Role:</strong> {playerProfile.socialRole}</p>
            <p style={{ fontSize: '14px', color: '#b0b8d0', margin: '4px 0' }}><strong>Personality:</strong> {personality}</p>
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div onClick={() => setShowSecret(!showSecret)} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ marginTop: '0', color: '#fff' }}>🔒 Private Mission</h3>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,0,0.7)' }}>(Only you can see) {showSecret ? '▲' : '▼'}</span>
            </div>
            {showSecret && (
              <div>
                <h4 style={{ color: '#EAEAEA' }}>Secret Backstory:</h4>
                <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#b0b8d0' }}>{mission.secretBackstory}</p>
                <h4 style={{ color: '#EAEAEA', marginTop: '16px' }}>Main Mission:</h4>
                <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#b0b8d0' }}>{mission.mainMission}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
};

const DialogueArea = ({ gameState, onSendMessage, onEndTurn, opponentProfile }: { gameState: GameState, onSendMessage: (content: string, type: 'text' | 'voice') => Promise<void>, onEndTurn: () => void, opponentProfile: UserProfile | null }) => {
    const [text, setText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    const playerMessageCount = gameState.chatLog.filter((m: Message) => m.senderId === 'player1' && m.round === gameState.round).length;
    const canSendMessage = playerMessageCount < MAX_MESSAGES_PER_ROUND && gameState.currentPhase === 'chat';

    // Auto-scroll to bottom when new messages are added
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [gameState.chatLog.length]);

    const handleSendText = () => { if (text.trim() && canSendMessage) { onSendMessage(text, 'text'); setText(''); } };

    const handleSendVoice = () => {
        console.log('🎤 [handleSendVoice] Called with:', { 
            recordedAudioUrl: recordedAudioUrl ? 'exists' : 'null', 
            canSendMessage 
        });
        
        if (recordedAudioUrl && canSendMessage) {
            console.log('🎤 [handleSendVoice] Sending voice message...');
            onSendMessage(recordedAudioUrl, 'voice');
            setRecordedAudioUrl(null);
            setPreviewAudioUrl(null);
        } else {
            console.warn('🎤 [handleSendVoice] Cannot send:', { 
                recordedAudioUrl: !!recordedAudioUrl, 
                canSendMessage 
            });
        }
    };

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => { resolve(reader.result as string); };
            reader.onerror = (error) => { reject(error); };
        });
    };

    const handleToggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // Use unified MediaRecorder utility for consistent webm format
                const { createMediaRecorder, createAudioBlob } = await import('../utils/mediaRecorderUtils');
                const mediaRecorder = createMediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                const audioChunks: Blob[] = [];

                mediaRecorder.ondataavailable = event => { audioChunks.push(event.data); };
                mediaRecorder.onstop = async () => {
                    const audioBlob = createAudioBlob(audioChunks);
                    const audioDataUrl = await blobToBase64(audioBlob);
                    console.log('🎙️ [Recording Stop] Setting recordedAudioUrl, length:', audioDataUrl.length);
                    setRecordedAudioUrl(audioDataUrl);
                    
                    // Generate AI voice preview
                    try {
                        console.log('🎵 [Preview] Starting AI voice generation for preview...');
                        
                        // Convert data URL back to Blob for speech-to-text
                        const base64Audio = audioDataUrl.split(',')[1];
                        const binaryData = atob(base64Audio);
                        const arrayBuffer = new ArrayBuffer(binaryData.length);
                        const view = new Uint8Array(arrayBuffer);
                        for (let i = 0; i < binaryData.length; i++) {
                            view[i] = binaryData.charCodeAt(i);
                        }
                        const previewBlob = new Blob([arrayBuffer], { type: 'audio/mp4' });
                        
                        // Get text transcription
                        const { uploadSpeechToText } = await import('../utils/speechUtils');
                        const transcribedText = await uploadSpeechToText(previewBlob);
                        console.log('🎵 [Preview] Transcribed text for preview:', transcribedText);
                        
                        // Get user's voice profile for preview and apply Local Effect to user's recording
                        const userVoice = typeof window !== 'undefined' ? localStorage.getItem("selectedVoice") : null;
                        console.log('🎵 [Preview] User voice from localStorage:', userVoice);
                        if (userVoice) {
                            try {
                                console.log('🎵 [Preview] Processing user recording with voice effect:', userVoice);
                                
                                // Get voice effect configuration
                                const { voiceProcessingService } = await import('../lib/voiceProcessing');
                                const availableEffects = voiceProcessingService.getAvailableEffects();
                                const effect = availableEffects.find(e => e.id === userVoice);
                                
                                if (effect && effect.apiProvider === 'elevenlabs' && effect.voiceId) {
                                    console.log('🎵 [Preview] Using ElevenLabs voice for preview:', userVoice);
                                    
                                    // For ElevenLabs, we need to transcribe and regenerate
                                    if (transcribedText && transcribedText.trim()) {
                                        const ttsResponse = await fetch('/api/elevenlabs-tts', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ 
                                                text: transcribedText, 
                                                voiceId: effect.voiceId 
                                            })
                                        });
                                        
                                        if (ttsResponse.ok) {
                                            const audioBlob = await ttsResponse.blob();
                                            const previewUrl = URL.createObjectURL(audioBlob);
                                            setPreviewAudioUrl(previewUrl);
                                            console.log('🎵 [Preview] ElevenLabs voice generated for preview via backend API');
                                        } else {
                                            console.warn('🎵 [Preview] Backend TTS failed, using original recording');
                                            setPreviewAudioUrl(audioDataUrl);
                                        }
                                    } else {
                                        console.warn('🎵 [Preview] No transcribed text, using original recording');
                                        setPreviewAudioUrl(audioDataUrl);
                                    }
                                } else if (effect && effect.apiProvider === 'local') {
                                    console.log('🎛️ [Preview] Using Local Effect for user recording preview:', userVoice);
                                    
                                    // For Local Effects, apply directly to the original recording
                                    const localResult = await voiceProcessingService.processVoice(audioBlob, effect);
                                    
                                    if (localResult.success && localResult.audioUrl) {
                                        setPreviewAudioUrl(localResult.audioUrl);
                                        console.log('🎵 [Preview] Local Effect applied to user recording for preview');
                                    } else {
                                        throw new Error(localResult.error || 'Local processing failed');
                                    }
                                } else {
                                    console.warn('🎵 [Preview] No specific voice effect found, using original recording');
                                    setPreviewAudioUrl(audioDataUrl);
                                }
                            } catch (error) {
                                console.error('🎵 [Preview] Error with voice processing:', error);
                                setPreviewAudioUrl(audioDataUrl);
                            }
                        } else {
                            console.warn('🎵 [Preview] No voice selected, using original recording');
                            setPreviewAudioUrl(audioDataUrl);
                        }
                    } catch (error) {
                        console.error('🎵 [Preview] Failed to generate AI voice preview:', error);
                        setPreviewAudioUrl(audioDataUrl); // Fallback to original
                    }
                    
                    setIsRecording(false);
                    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
                    setRecordingTime(0);
                    stream.getTracks().forEach(track => track.stop());
                };
                
                mediaRecorder.start();
                setIsRecording(true);
                setRecordingTime(0);
                recordingIntervalRef.current = setInterval(() => {
                    setRecordingTime(prev => {
                        const newTime = prev + 1;
                        if (newTime >= MAX_VOICE_CLIP_SECONDS) {
                            mediaRecorderRef.current?.stop();
                        }
                        return newTime;
                    });
                }, 1000);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Could not access microphone. Please check your browser permissions.");
            }
        }
    };

    const handleDeleteRecording = () => {
        setRecordedAudioUrl(null);
        setPreviewAudioUrl(null);
    };
    
    const getMessageStyle = (msg: Message): CSSProperties => {
        const baseStyle: CSSProperties = { maxWidth: '70%', color: 'white', padding: '8px 12px', borderRadius: '16px', whiteSpace: 'pre-wrap' };
        if (msg.senderId === 'system') {
            return { ...baseStyle, alignSelf: 'center', background: 'rgba(255, 255, 255, 0.15)', fontStyle: 'italic', maxWidth: '85%', textAlign: 'left' };
        }
        return { ...baseStyle, alignSelf: msg.senderId === 'player1' ? 'flex-end' : 'flex-start', background: msg.senderId === 'player1' ? 'rgba(83, 72, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)' };
    };

    const renderInputArea = () => {
        if (!canSendMessage) {
            return <p style={{textAlign: 'center', color: '#b0b8d0'}}>Message limit reached. You can now end the turn.</p>
        }
    
        const inputContainerStyle: CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '25px',
            padding: '5px',
        };
    
        const textInputStyle: CSSProperties = {
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#fff',
            padding: '10px 15px',
            outline: 'none',
            fontSize: '15px'
        };
    
        const iconButtonStyle: CSSProperties = {
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '24px',
            padding: '0 10px',
        };
    
        if (isRecording) {
            return (
                <div style={inputContainerStyle}>
                    <span style={{color: '#E0E0E0', paddingLeft: '15px', flex: 1}}>🎙️ Recording... {recordingTime}s / {MAX_VOICE_CLIP_SECONDS}s</span>
                    <button style={{...getButtonStyle(), background: '#E53E3E'}} onClick={handleToggleRecording}>Stop</button>
                </div>
            );
        }
    
        if (recordedAudioUrl) {
            console.log('🎵 [UI] Showing Send button for recorded audio');
            return (
                <div style={inputContainerStyle}>
                    <AudioPlayer src={previewAudioUrl || recordedAudioUrl} context="preview" />
                    <span style={{flex: 1}}></span>
                    <button style={{...iconButtonStyle, fontSize: '20px'}} onClick={handleDeleteRecording}>🗑️</button>
                    <button style={{...getButtonStyle(), background: '#38A169'}} onClick={handleSendVoice}>Send</button>
                </div>
            )
        }
    
        return (
            <div style={inputContainerStyle}>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                    placeholder="Type a message, or click 🎙️ to record"
                    style={textInputStyle}
                />
                {text ? (
                    <button style={getButtonStyle()} onClick={handleSendText}>Send</button>
                ) : (
                    <button style={iconButtonStyle} onClick={handleToggleRecording}>🎙️</button>
                )}
            </div>
        )
    };

    return (
        <>
            <style jsx>{`
                .rpg-chat-container::-webkit-scrollbar {
                    width: 8px;
                }
                .rpg-chat-container::-webkit-scrollbar-track {
                    background: rgba(44, 52, 80, 0.5);
                    border-radius: 10px;
                }
                .rpg-chat-container::-webkit-scrollbar-thumb {
                    background: rgba(123, 97, 255, 0.6);
                    border-radius: 10px;
                }
                .rpg-chat-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(123, 97, 255, 0.8);
                }
            `}</style>
            <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '16px'}}>
                <h2 style={{margin: 0}}>🗨️ {gameState.currentPhase === 'finalDecision' ? 'Final Decision' : `Round ${gameState.round}`}</h2>
                <span style={{fontSize: '14px', color: '#b0b8d0'}}>{gameState.currentPhase === 'chat' && `${MAX_MESSAGES_PER_ROUND-playerMessageCount} / ${MAX_MESSAGES_PER_ROUND} messages left`}</span>
            </div>
            <div 
                ref={chatContainerRef}
                style={{ 
                    height: '300px', 
                    overflowY: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px', 
                    padding: '0 10px', 
                    marginBottom: '16px',
                    // Custom scrollbar styles (same as Profile Bubble) - Firefox support
                    scrollbarWidth: 'thin' as const,
                    scrollbarColor: 'rgba(123, 97, 255, 0.6) rgba(44, 52, 80, 0.5)'
                }}
                className="rpg-chat-container"
            >
                {gameState.chatLog.map((msg: Message, index: number) => (
                    <div key={index} style={{ opacity: msg.round !== gameState.round ? 0.6 : 1, ...getMessageStyle(msg) }}>
                        {msg.type === 'voice' ? <AudioPlayer src={msg.content} context="chat" /> : msg.content}
                    </div>
                ))}
            </div>
            {gameState.currentPhase === 'chat' && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px'}}>
                   {renderInputArea()}
                   <button style={{...getButtonStyle(), width: '100%', marginTop: '10px', background: 'rgba(200, 80, 80, 0.8)'}} onClick={onEndTurn}>End Turn</button>
                </div>
            )}
        </div>
        </>
    );
};

const ActionSelector = ({ onSelectAction, gameState }: { onSelectAction: (tag: string) => Promise<void>, gameState: GameState }) => {
    const { currentPhase, selectedActions, round } = gameState;
    const actionsForRound = ROUND_ACTIONS[round - 1] || [];
    const waitingForOpponent = selectedActions.player1 && !selectedActions.player2;
    return (
        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', opacity: currentPhase !== 'selectAction' ? 0.5 : 1, pointerEvents: currentPhase !== 'selectAction' ? 'none' : 'auto' }}>
            <h2 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>🎯 Choose your next action</h2>
            {waitingForOpponent && <p style={{textAlign: 'center', color: '#fff'}}>Waiting for opponent...</p>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                {actionsForRound.map(action => (
                    <button key={action.tag} style={{...getButtonStyle(), textAlign: 'left', background: selectedActions.player1 === action.tag ? 'rgba(83, 72, 255, 0.8)' : getButtonStyle().background}} onClick={() => onSelectAction(action.tag)} disabled={!!selectedActions.player1}>
                        <strong>{action.label}</strong>
                        <p style={{fontSize: '12px', margin: '4px 0 0', opacity: 0.8}}>{action.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const FinalChoiceSelector = ({ onSelectChoice, playerProfile, gameState }: { onSelectChoice: (choice: FinalChoiceOption) => Promise<void>, playerProfile: PlayerProfile, gameState: GameState }) => {
    const { currentPhase, selectedActions } = gameState;
    const choices = FINAL_CHOICES[playerProfile.background] || FINAL_CHOICES['Default'];
    if (currentPhase !== 'finalDecision') return null;
    return (
        <div style={{ padding: '20px', background: 'rgba(150, 50, 50, 0.3)', border: '1px solid rgba(255,100,100,0.5)', borderRadius: '12px' }}>
            <h2 style={{ color: '#FFD700', borderBottom: '1px solid rgba(255,215,0,0.3)', paddingBottom: '10px' }}>⚡ FINAL CHOICE ⚡</h2>
            <p style={{color: 'white', textAlign: 'center', fontStyle: 'italic'}}>The story reaches its climax. Your next choice will determine your fate.</p>
            {selectedActions.player1 && <p style={{textAlign: 'center', color: '#fff'}}>Waiting for opponent's final decision...</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {choices.map(choice => (
                    <button key={choice.tag} style={{...getButtonStyle(), textAlign: 'left', background: 'rgba(255,255,255,0.1)'}} onClick={() => onSelectChoice(choice)} disabled={!!selectedActions.player1}>
                        <strong>{choice.label}</strong>
                        <p style={{fontSize: '12px', margin: '4px 0 0', opacity: 0.8}}>{choice.outcome}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const SideQuestTracker = ({ mission }: { mission: SideMission | undefined }) => {
    if (!mission) return null;
    return (
        <div style={{marginTop: '20px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px'}}>
            <h3 style={{marginTop: 0, color: '#fff'}}>🎯 Side Quest (Round {mission.round})</h3>
            <p style={{fontSize: '14px', color: '#b0b8d0'}}>{mission.description} {mission.success && '✅'}</p>
        </div>
    );
};

const FinalResults = ({ scores, onShare }: { scores: FinalScore | null, onShare: () => void }) => {
    if (!scores) return <p style={{color: 'white', textAlign: 'center'}}>Calculating final score...</p>;
    return (
        <div style={{ padding: '20px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
            <h2 style={{fontSize: '2em', color: '#FFD700'}}>🎭 Final Results</h2>
            <h3 style={{fontSize: '2.5em', margin: '10px 0'}}>🏆 {scores.totalScore} / 9</h3>
            <div style={{display: 'flex', justifyContent: 'space-around', margin: '20px 0', textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px'}}>
                <p>🎯 Main Mission: {scores.mainMission ? '✅ +3' : '❌ +0'}</p>
                <p>🕵️ Side Quests: {scores.sideMissions} / 3</p>
                <p>🎤 Performance: {scores.performance} / 3</p>
            </div>
            <p style={{fontSize: '1.2em', fontStyle: 'italic'}}>🏅 {scores.title}</p>
            <p style={{margin: '20px 0'}}>{scores.endingText}</p>
            <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px'}}>
                <button style={getButtonStyle()} onClick={onShare}>📤 Share Results</button>
            </div>
        </div>
    );
};

// --- Main Page Component ---
export default function RPGPage() {
    const router = useRouter();
    const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
    const [opponentProfile, setOpponentProfile] = useState<UserProfile | null>(null);
    const [botFullProfile, setBotFullProfile] = useState<BotProfile | null>(null);
    const [missionData, setMissionData] = useState<MissionData | null>(null);
    const [gameState, dispatch] = useReducer(gameReducer, getInitialState());
    const [showContinuePrompt, setShowContinuePrompt] = useState(false);
    const [pendingGameState, setPendingGameState] = useState<GameState | null>(null);


    useEffect(() => {
        if (!router.isReady) return;

        const savedRole = localStorage.getItem('userRole');
        const { opponentId } = router.query;

        if (savedRole) {
            const parsedRole = JSON.parse(savedRole);
            setPlayerProfile(parsedRole);
            setMissionData(MISSIONS[parsedRole.background] || MISSIONS["Default"]);

            if (opponentId) {
                const opponent = MOCK_USERS.find(user => user.id === opponentId);
                setOpponentProfile(opponent || null);
                if (opponent) {
                    const opponentMissions = MISSIONS[opponent.role.background] || MISSIONS["Default"];
                    setBotFullProfile({
                        name: opponent.name,
                        background: opponent.role.background,
                        socialRole: opponent.role.socialRole,
                        personality: Array.isArray(opponent.role.personality) ? opponent.role.personality.join(', ') : opponent.role.personality,
                        secretBackstory: opponentMissions.secretBackstory,
                        mainMission: opponentMissions.mainMission,
                    });
                }
            } else {
                router.push('/app');
                return;
            }

            const savedGameState = localStorage.getItem('gameState');
            if (savedGameState) {
                try {
                    const parsedState = JSON.parse(savedGameState);
                    if (parsedState.round && parsedState.currentPhase && parsedState.sideMissions && parsedState.sideMissions.player1) {
                         if (parsedState.currentPhase !== 'result') {
                            // Unfinished game found
                            setPendingGameState(parsedState);
                            setShowContinuePrompt(true);
                        } else {
                            // Finished game, load it to show the results
                            dispatch({ type: 'LOAD_STATE', payload: parsedState });
                        }
                    } else {
                        console.warn("Saved game state was invalid. Starting fresh.");
                        dispatch({ type: 'RESET_GAME' });
                    }
                } catch (error) {
                    console.error("Failed to parse saved game state:", error);
                    dispatch({ type: 'RESET_GAME' });
                }
            }
        } else {
            router.push('/role');
        }
    }, [router.isReady, router.query]);

    useEffect(() => {
        // Do not save the initial state on first render, wait for player profile.
        if (playerProfile && gameState.chatLog.length > 0) {
             localStorage.setItem('gameState', JSON.stringify(gameState));
        }
    }, [gameState, playerProfile]);

    const handleSendMessage = async (content: string, type: 'text' | 'voice' = 'text') => {
        console.log('📨 [handleSendMessage] Called with:', { type, content: content.length + ' chars', botFullProfile: !!botFullProfile });
        
        if (!botFullProfile) {
            console.warn('📨 [handleSendMessage] No botFullProfile, returning');
            return;
        }
        const playerMessageCount = gameState.chatLog.filter(m => m.senderId === 'player1' && m.round === gameState.round).length;
        if (playerMessageCount >= MAX_MESSAGES_PER_ROUND || gameState.currentPhase !== 'chat') {
            console.warn('📨 [handleSendMessage] Cannot send message:', { playerMessageCount, MAX_MESSAGES_PER_ROUND, currentPhase: gameState.currentPhase });
            return;
        }
    
        let textForAI: string = '';
        let userMessage: Message;
    
        if (type === 'voice') {
            let aiVoiceUrl: string = content; // fallback to original audio
            try {
                // Convert data URL back to Blob
                const base64Audio = content.split(',')[1];
                const binaryData = atob(base64Audio);
                const arrayBuffer = new ArrayBuffer(binaryData.length);
                const view = new Uint8Array(arrayBuffer);
                for (let i = 0; i < binaryData.length; i++) {
                    view[i] = binaryData.charCodeAt(i);
                }
                const audioBlob = new Blob([arrayBuffer], { type: 'audio/webm' });
                
                // Step 1: Use unified speech-to-text upload function
                const { uploadSpeechToText } = await import('../utils/speechUtils');
                textForAI = await uploadSpeechToText(audioBlob);
                
                // Step 2: Generate AI voice using the transcribed text (AI always uses default ElevenLabs voice)
                if (textForAI && textForAI.trim()) {
                    console.log("🎤 Generating AI voice for transcribed text:", textForAI);
                    
                    // AI always uses default ElevenLabs voice, not user's selected voice
                    const aiVoiceToUse = 'elevenlabs-aria'; // Default AI voice
                    console.log("🎵 [Send] AI using default voice:", aiVoiceToUse);
                    
                    try {
                        // Get voice effect configuration for AI voice
                        const { voiceProcessingService } = await import('../lib/voiceProcessing');
                        const availableEffects = voiceProcessingService.getAvailableEffects();
                        const effect = availableEffects.find(e => e.id === aiVoiceToUse);
                        
                        if (effect && effect.apiProvider === 'elevenlabs' && effect.voiceId) {
                            console.log('🎵 [Send] Generating AI voice using backend API for:', aiVoiceToUse);
                            
                            const ttsResponse = await fetch('/api/elevenlabs-tts', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                    text: textForAI, 
                                    voiceId: effect.voiceId 
                                })
                            });
                            
                            if (ttsResponse.ok) {
                                const aiAudioBlob = await ttsResponse.blob();
                                aiVoiceUrl = URL.createObjectURL(aiAudioBlob);
                                console.log("✅ AI voice generated successfully via backend API");
                            } else {
                                console.warn("⚠️ Backend TTS failed, using fallback method");
                                // Fallback to utils/voiceUtils method
                                const { playUserVoice } = await import('../utils/voiceUtils');
                                const fallbackUrl = await playUserVoice(textForAI, aiVoiceToUse, false);
                                if (fallbackUrl) {
                                    aiVoiceUrl = fallbackUrl;
                                    console.log("✅ AI voice generated with fallback method");
                                }
                            }
                        } else {
                            console.warn('🎵 [Send] No specific AI voice effect found, using fallback method');
                            // Fallback to utils/voiceUtils method
                            const { playUserVoice } = await import('../utils/voiceUtils');
                            const fallbackUrl = await playUserVoice(textForAI, aiVoiceToUse, false);
                            if (fallbackUrl) {
                                aiVoiceUrl = fallbackUrl;
                                console.log("✅ AI voice generated with fallback method");
                            }
                        }
                    } catch (voiceProcessingError) {
                        console.warn("⚠️ Voice processing service failed:", voiceProcessingError);
                        // Fallback to utils/voiceUtils method
                        const { playUserVoice } = await import('../utils/voiceUtils');
                        const fallbackUrl = await playUserVoice(textForAI, aiVoiceToUse, false);
                        if (fallbackUrl) {
                            aiVoiceUrl = fallbackUrl;
                            console.log("✅ AI voice generated with fallback method");
                        }
                    }
                }
            } catch (error: any) {
                console.error("Speech-to-text or AI voice generation error:", error);
                textForAI = `[Voice message failed to process: ${error.message}]`;
            }
            userMessage = { senderId: 'player1', content: aiVoiceUrl, type, round: gameState.round, timestamp: Date.now(), senderName: "You", transcribedText: textForAI };
        } else { // type is 'text'
            textForAI = content;
            userMessage = { senderId: 'player1', content: content, type, round: gameState.round, timestamp: Date.now(), senderName: "You" };
        }
    
        dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    
        try {
            const botSideMission = gameState.sideMissions.player2.find(m => m.round === gameState.round) || null;
            const currentLog = [...gameState.chatLog, userMessage];
            const historyForAI = currentLog.map(msg => {
                let msgContent = '';
                if (msg.type === 'text') {
                    msgContent = msg.content;
                } else if (msg.type === 'voice') {
                    msgContent = msg.transcribedText || '[Voice message]';
                }
                // Remove name prefix from history to prevent AI from including names in responses
                return { role: msg.senderId === 'player1' ? 'user' : 'assistant', content: msgContent };
            }).slice(-10); // Truncate history here
    
            // Use backend API for AI response generation
            console.log('🤖 Using backend API for RPG AI response generation');
            
            // Create comprehensive personality prompt for the bot
            const currentSideMission = gameState.sideMissions.player2.find(m => m.round === gameState.round);
            const sideMissionInfo = currentSideMission ? `\nCURRENT SIDE MISSION: ${currentSideMission.description}` : '';
            
            const botPersonality = `You are ${botFullProfile.name}, a character in an RPG game. You must stay completely in character and respond as ${botFullProfile.name} would.

GAME SCENARIO:
You are in a stationary elevator with polished mahogany walls and a faint smell of ozone. There's another person here who seems just as confused as you. A disembodied voice announced: "The test begins now. Convince your partner to press their button first. Only one of you may proceed." There are two large, unlabeled buttons on the control panel.

CHARACTER PROFILE:
- Background: ${botFullProfile.background}
- Social Role: ${botFullProfile.socialRole}
- Personality: ${botFullProfile.personality}
- Secret Backstory: ${botFullProfile.secretBackstory}
- Main Mission: ${botFullProfile.mainMission}${sideMissionInfo}

CURRENT ROUND: ${gameState.round} of ${gameState.maxRounds}

IMPORTANT: You are in a high-stakes RPG scenario. Your responses must reflect your character's background, personality, and mission. Consider your secret backstory, main mission, and current side mission in every response. Be authentic to your character - don't break character or be overly helpful. Respond naturally as ${botFullProfile.name} would in this situation.

RESPONSE STYLE: Keep your responses casual, conversational, and natural. Use everyday language, contractions, and speak like a real person in a tense situation. Don't be overly formal or robotic. Show emotion, hesitation, and human-like reactions.`;

            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: historyForAI[historyForAI.length - 1]?.content || 'Continue the conversation',
                    personality: botPersonality,
                    conversationHistory: historyForAI.slice(0, -1) // Exclude the last message as it's included in message
                })
            });
            
            let aiResponseText;
            if (response.ok) {
                const result = await response.json();
                console.log('✅ RPG AI response generated via backend API');
                aiResponseText = result.response;
            } else {
                throw new Error('Backend AI API failed for RPG response');
            }
            
            const aiResponse = { text: aiResponseText };
            
            // Clean up AI response to remove any name prefix that might still exist
            let cleanedResponse = aiResponse.text;
            const namePrefix = `${botFullProfile.name}:`;
            if (cleanedResponse.startsWith(namePrefix)) {
                cleanedResponse = cleanedResponse.substring(namePrefix.length).trim();
            }
            
            dispatch({ type: 'ADD_MESSAGE', payload: { senderId: 'player2', content: cleanedResponse, type: 'text', round: gameState.round, timestamp: Date.now(), senderName: botFullProfile.name } });
        } catch (error: any) {
            console.error("AI opponent response error:", error);
            dispatch({ type: 'ADD_MESSAGE', payload: { senderId: 'system', content: `(System Error: The opponent's AI failed to respond. ${error.message})`, type: 'system', round: gameState.round, timestamp: Date.now(), senderName: 'System' } });
        }
    };

    const handleEndTurn = () => dispatch({ type: 'SET_PHASE', payload: 'selectAction' });

    const handleSelectAction = async (actionTag: string) => {
        if (gameState.selectedActions.player1 || !botFullProfile) return;
        dispatch({ type: 'SELECT_ACTION', payload: { playerId: 'player1', actionTag } });
        
        const botSideMission = gameState.sideMissions.player2.find(m => m.round === gameState.round) || null;
        // Use backend API for bot action selection
        console.log('🤖 Using backend API for RPG bot action selection');
        let botAction = ROUND_ACTIONS[gameState.round - 1][0].tag; // Default fallback
        try {
            // Create comprehensive personality prompt for the bot action selection
            const currentSideMission = gameState.sideMissions.player2.find(m => m.round === gameState.round);
            const sideMissionInfo = currentSideMission ? `\nCURRENT SIDE MISSION: ${currentSideMission.description}` : '';
            
            const botPersonality = `You are ${botFullProfile.name}, a character in an RPG game. You must stay completely in character and respond as ${botFullProfile.name} would.

GAME SCENARIO:
You are in a stationary elevator with polished mahogany walls and a faint smell of ozone. There's another person here who seems just as confused as you. A disembodied voice announced: "The test begins now. Convince your partner to press their button first. Only one of you may proceed." There are two large, unlabeled buttons on the control panel.

CHARACTER PROFILE:
- Background: ${botFullProfile.background}
- Social Role: ${botFullProfile.socialRole}
- Personality: ${botFullProfile.personality}
- Secret Backstory: ${botFullProfile.secretBackstory}
- Main Mission: ${botFullProfile.mainMission}${sideMissionInfo}

CURRENT ROUND: ${gameState.round} of ${gameState.maxRounds}

IMPORTANT: You are in a high-stakes RPG scenario. Based on your character's background, personality, and mission, choose the best action from these options: ${ROUND_ACTIONS[gameState.round - 1].map(a => `${a.tag}: ${a.description}`).join(', ')}. 

Consider your secret backstory, main mission, and current side mission when choosing. Respond with only the action tag.

RESPONSE STYLE: Keep your responses casual, conversational, and natural. Use everyday language, contractions, and speak like a real person in a tense situation. Don't be overly formal or robotic. Show emotion, hesitation, and human-like reactions.`;

            const actionResponse = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: botPersonality,
                    personality: botPersonality,
                    conversationHistory: gameState.chatLog.slice(-10).map(msg => ({
                        role: msg.senderId === 'player1' ? 'user' : 'assistant',
                        content: msg.type === 'text' ? msg.content : (msg.transcribedText || '[Voice message]')
                    }))
                })
            });
            
            if (actionResponse.ok) {
                const result = await actionResponse.json();
                const selectedAction = result.response.trim().toLowerCase();
                // Find matching action or default to first available
                const validAction = ROUND_ACTIONS[gameState.round - 1].find(a => a.tag.toLowerCase() === selectedAction);
                botAction = validAction ? validAction.tag : ROUND_ACTIONS[gameState.round - 1][0].tag;
                console.log('✅ RPG bot action selected via backend API:', botAction);
            } else {
                throw new Error('Backend AI API failed for bot action selection');
            }
        } catch (error) {
            console.error('❌ Error selecting bot action via backend:', error);
            // Fallback to random action
            botAction = ROUND_ACTIONS[gameState.round - 1][Math.floor(Math.random() * ROUND_ACTIONS[gameState.round - 1].length)].tag;
            console.log('🎲 Using fallback random action:', botAction);
        }
        dispatch({ type: 'SELECT_ACTION', payload: { playerId: 'player2', actionTag: botAction } });
    };

    const handleSelectFinalChoice = async (choice: FinalChoiceOption) => {
        if (gameState.currentPhase !== 'finalDecision' || gameState.selectedActions.player1 || !botFullProfile || !playerProfile) return;
    
        dispatch({ type: 'SELECT_ACTION', payload: { playerId: 'player1', actionTag: choice.tag } });
        dispatch({ type: 'SET_MAIN_MISSION_SUCCESS', payload: choice.success });
    
        const availableChoices = FINAL_CHOICES[botFullProfile.background] || FINAL_CHOICES['Default'];
        // Use backend API for bot final choice selection
        console.log('🤖 Using backend API for RPG bot final choice selection');
        let botChoiceTag;
        try {
            const choicePrompt = `Based on our conversation and your character, choose the best final decision from these options: ${availableChoices.map(c => `${c.tag}: ${c.label}`).join(', ')}. Respond with only the choice tag.`;
            const choiceResponse = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: choicePrompt,
                    personality: botFullProfile.name,
                    conversationHistory: gameState.chatLog.slice(-10).map(msg => ({
                        role: msg.senderId === 'player1' ? 'user' : 'assistant',
                        content: msg.type === 'text' ? msg.content : (msg.transcribedText || '[Voice message]')
                    }))
                })
            });
            
            if (choiceResponse.ok) {
                const result = await choiceResponse.json();
                const selectedChoice = result.response.trim().toLowerCase();
                const validChoice = availableChoices.find(c => c.tag.toLowerCase() === selectedChoice);
                botChoiceTag = validChoice ? validChoice.tag : availableChoices[0].tag;
                console.log('✅ RPG bot final choice selected via backend API:', botChoiceTag);
            } else {
                throw new Error('Backend AI API failed for bot final choice selection');
            }
        } catch (error) {
            console.error('❌ Error selecting bot final choice via backend:', error);
            botChoiceTag = availableChoices[Math.floor(Math.random() * availableChoices.length)].tag;
            console.log('🎲 Using fallback random final choice:', botChoiceTag);
        }
        dispatch({ type: 'SELECT_ACTION', payload: { playerId: 'player2', actionTag: botChoiceTag } });
    };

    useEffect(() => {
        const { player1, player2 } = gameState.selectedActions;

        if (player1 && player2 && gameState.currentPhase === 'selectAction' && playerProfile && botFullProfile) {
             (async () => {
                const playerActionInfo = ROUND_ACTIONS[gameState.round - 1]?.find(a => a.tag === player1);
                const opponentActionInfo = ROUND_ACTIONS[gameState.round - 1]?.find(a => a.tag === player2);
                
                if (playerActionInfo && opponentActionInfo) {
                    // Use backend API for narration generation
                    console.log('🤖 Using backend API for RPG narration generation');
                    let combinedEffectText;
                    try {
                        const narrationPrompt = `Generate a narrative describing the outcome of these actions in our RPG scenario: Player chose "${playerActionInfo.label}" and opponent chose "${opponentActionInfo.label}". Keep it brief and dramatic.`;
                        const narrationResponse = await fetch('/api/ai-chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                message: narrationPrompt,
                                personality: 'Narrator',
                                conversationHistory: gameState.chatLog.slice(-10).map(msg => ({
                                    role: msg.senderId === 'player1' ? 'user' : 'assistant',
                                    content: msg.type === 'text' ? msg.content : (msg.transcribedText || '[Voice message]')
                                }))
                            })
                        });
                        
                        if (narrationResponse.ok) {
                            const result = await narrationResponse.json();
                            combinedEffectText = result.response;
                            console.log('✅ RPG narration generated via backend API');
                        } else {
                            throw new Error('Backend AI API failed for narration generation');
                        }
                    } catch (error) {
                        console.error('❌ Error generating narration via backend:', error);
                        combinedEffectText = `The tension builds as both players make their moves. ${playerActionInfo.label} meets ${opponentActionInfo.label} in an unexpected turn of events.`;
                        console.log('📖 Using fallback narration');
                    }
                    
                    const narrativeContent = `🧾 Round ${gameState.round} Action Outcome:\n\n` +
                                             `🎭 You chose: ${playerActionInfo.label}\n` +
                                             `🎭 ${opponentProfile?.name || 'Opponent'} chose: ${opponentActionInfo.label}\n\n` +
                                             `📘 Result: ${combinedEffectText}`;

                    dispatch({ type: 'ADD_MESSAGE', payload: { 
                        senderId: 'system', 
                        content: narrativeContent,
                        type: 'system', 
                        round: gameState.round, 
                        timestamp: Date.now(), 
                        senderName: 'System' 
                    }});
                }

                const playerSideMission = gameState.sideMissions.player1.find(m => m.round === gameState.round);
                if (playerSideMission && player2 === playerSideMission.targetActionTag) {
                    dispatch({ type: 'COMPLETE_SIDE_MISSION', payload: { round: gameState.round, player: 'player1' } });
                }
                
                const opponentSideMission = gameState.sideMissions.player2.find(m => m.round === gameState.round);
                if(opponentSideMission && player1 === opponentSideMission.targetActionTag) {
                    dispatch({ type: 'COMPLETE_SIDE_MISSION', payload: { round: gameState.round, player: 'player2' } });
                }

                setTimeout(() => {
                    if (gameState.round < gameState.maxRounds) {
                        dispatch({ type: 'ADVANCE_ROUND' });
                    } else {
                        dispatch({ type: 'ADD_MESSAGE', payload: { 
                            senderId: 'system', 
                            content: 'The decisions made have pushed the situation to its critical point. The air in the elevator grows heavy as the final moment of truth arrives...',
                            type: 'system', 
                            round: gameState.round, 
                            timestamp: Date.now(), 
                            senderName: 'System' 
                        }});
                        setTimeout(() => {
                            dispatch({ type: 'SET_PHASE', payload: 'finalDecision' });
                        }, 3000);
                    }
                }, 3000);
            })();
        }
    }, [gameState.selectedActions, gameState.currentPhase, gameState.round, gameState.maxRounds, playerProfile, botFullProfile, opponentProfile?.name]);

    // Effect for handling the final choice conclusion
    useEffect(() => {
        const { player1, player2 } = gameState.selectedActions;
        if (player1 && player2 && gameState.currentPhase === 'finalDecision' && playerProfile && botFullProfile) {
            const playerChoice = (FINAL_CHOICES[playerProfile.background] || FINAL_CHOICES['Default']).find(c => c.tag === player1);
            const opponentChoice = (FINAL_CHOICES[botFullProfile.background] || FINAL_CHOICES['Default']).find(c => c.tag === player2);

            const narrativeSummary = `In a climactic move, you chose to '${playerChoice?.label || 'act'}'. Your opponent responded by choosing to '${opponentChoice?.label || 'react'}'. The air crackles with the consequences of your decisions.`;
            dispatch({ type: 'ADD_MESSAGE', payload: { senderId: 'system', content: narrativeSummary, type: 'system', round: gameState.round, timestamp: Date.now(), senderName: 'System' } });
    
            setTimeout(() => calculateFinalScore(), 2000);
        }
    }, [gameState.selectedActions, gameState.currentPhase, playerProfile, botFullProfile]);

    // Effect for Bot's opening message each round
    useEffect(() => {
        if (gameState.currentPhase === 'chat' && botFullProfile) {
            const isRoundStart = gameState.chatLog.filter(m => m.round === gameState.round && m.senderId !== 'system').length === 0;
            if (isRoundStart) {
                (async () => {
                    try {
                        const botSideMission = gameState.sideMissions.player2.find(m => m.round === gameState.round) || null;
                        const historyForAI = gameState.chatLog.map(msg => {
                            let msgContent = msg.type === 'voice' ? msg.transcribedText || '[Voice message]' : msg.content;
                            // Remove name prefix from history to prevent AI from including names in responses
                            return { role: msg.senderId === 'player1' ? 'user' : 'assistant', content: msgContent };
                        }).slice(-10);
                        
                                const botPersonality = `You are ${botFullProfile.name}, a character in an RPG game. You must stay completely in character and respond as ${botFullProfile.name} would.

GAME SCENARIO:
You are in a stationary elevator with polished mahogany walls and a faint smell of ozone. There's another person here who seems just as confused as you. A disembodied voice announced: "The test begins now. Convince your partner to press their button first. Only one of you may proceed." There are two large, unlabeled buttons on the control panel.

CHARACTER PROFILE:
- Background: ${botFullProfile.background}
- Social Role: ${botFullProfile.socialRole}
- Personality: ${botFullProfile.personality}
- Secret Backstory: ${botFullProfile.secretBackstory}
- Main Mission: ${botFullProfile.mainMission}
CURRENT SIDE MISSION: ${botSideMission?.description || 'None'}

CURRENT ROUND: ${gameState.round} of ${gameState.maxRounds}

IMPORTANT: You are in a high-stakes RPG scenario. Your responses must reflect your character's background, personality, and mission. Consider your secret backstory, main mission, and current side mission in every response. Be authentic to your character - don't break character or be overly helpful. Respond naturally as ${botFullProfile.name} would in this situation.

RESPONSE STYLE: Keep your responses casual, conversational, and natural. Use everyday language, contractions, and speak like a real person in a tense situation. Don't be overly formal or robotic. Show emotion, hesitation, and human-like reactions.`;
                                
                                console.log('🤖 Using backend API for RPG AI opening message generation');
                                const response = await fetch('/api/ai-chat', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        message: "Start the conversation as your character. Your first line should be a compelling opening in this tense scenario.",
                                        personality: botPersonality,
                                        conversationHistory: historyForAI
                                    })
                                });
                        
                        let aiResponseText;
                        if (response.ok) {
                            const result = await response.json();
                            console.log('✅ RPG AI opening message generated via backend API');
                            aiResponseText = result.response;
                        } else {
                            throw new Error('Backend AI API failed for RPG opening message');
                        }
                        
                        const aiResponse = { text: aiResponseText };
                        
                        // Clean up AI response to remove any name prefix that might still exist
                        let cleanedResponse = aiResponse.text;
                        const namePrefix = `${botFullProfile.name}:`;
                        if (cleanedResponse.startsWith(namePrefix)) {
                            cleanedResponse = cleanedResponse.substring(namePrefix.length).trim();
                        }
                        
                        dispatch({ type: 'ADD_MESSAGE', payload: { senderId: 'player2', content: cleanedResponse, type: 'text', round: gameState.round, timestamp: Date.now(), senderName: botFullProfile.name } });
                    } catch (error: any) {
                        console.error("AI opponent opening message error:", error);
                        dispatch({ type: 'ADD_MESSAGE', payload: { senderId: 'system', content: `(System Error: The opponent's AI failed to respond. ${error.message})`, type: 'system', round: gameState.round, timestamp: Date.now(), senderName: 'System' } });
                    }
                })();
            }
        }
    }, [gameState.currentPhase, gameState.round, botFullProfile]);


    const calculateFinalScore = async () => {
        if (gameState.isScoring || gameState.finalScore || !playerProfile) return;
        dispatch({ type: 'START_SCORING' });
        
        // Use backend API for performance scoring
        console.log('🤖 Using backend API for RPG performance scoring');
        let perfScoreResult;
        try {
            const scoringPrompt = `Rate this player's performance in our RPG scenario on a scale of 1-10 based on their conversation skills, strategy, and character roleplay. Respond with just a number.`;
            const scoringResponse = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: scoringPrompt,
                    personality: 'Judge',
                    conversationHistory: gameState.chatLog.map(msg => ({
                        role: msg.senderId === 'player1' ? 'user' : 'assistant',
                        content: msg.type === 'text' ? msg.content : (msg.transcribedText || '[Voice message]')
                    }))
                })
            });
            
            if (scoringResponse.ok) {
                const result = await scoringResponse.json();
                const score = parseInt(result.response.trim()) || 5;
                perfScoreResult = { totalScore: Math.max(1, Math.min(10, score)) };
                console.log('✅ RPG performance scored via backend API:', perfScoreResult.totalScore);
            } else {
                throw new Error('Backend AI API failed for performance scoring');
            }
        } catch (error) {
            console.error('❌ Error scoring performance via backend:', error);
            perfScoreResult = { totalScore: 5 }; // Neutral fallback score
            console.log('🎲 Using fallback performance score:', perfScoreResult.totalScore);
        }
        const perfScore = Math.round(perfScoreResult.totalScore);
        const sideMissionScore = gameState.sideMissions.player1.filter(m => m.success).length;
        const totalScore = (gameState.mainMissionSuccess ? 3 : 0) + sideMissionScore + perfScore;

        let endingText = '', title = '';
        if (totalScore >= 8) {
            title = "Master Manipulator";
            endingText = "You masterfully controlled the situation, making the other person act according to your script. The truth is now in your hands.";
        } else if (totalScore >= 5) {
            title = "Lead Actor";
            endingText = "You shone brightly in the story, but some mysteries remain. The elevator's secret is still turning.";
        } else {
            title = "Bystander";
            endingText = "Perhaps you weren't the protagonist after all? The plot was driven by someone else, and the truth slipped through your fingers.";
        }
        
        dispatch({ type: 'SET_FINAL_SCORE', payload: { mainMission: gameState.mainMissionSuccess, sideMissions: sideMissionScore, performance: perfScore, totalScore, endingText, title } });
    };
    
    const handleRestart = () => dispatch({ type: 'RESET_GAME' });
    const handleShare = () => {
        if (!gameState.finalScore) return;
        const { totalScore, title, endingText } = gameState.finalScore;
        const shareText = `I scored ${totalScore}/9 in the 1-on-1 RPG! My title: ${title}. ${endingText}`;
        navigator.clipboard.writeText(shareText).then(() => alert('Results copied to clipboard!'));
    };

    return (
        <div style={getPageContainerStyle()}>
            <GlobalNav />
            {showContinuePrompt && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1a1a2e', padding: '30px', borderRadius: '15px', color: 'white', textAlign: 'center', maxWidth: '400px', border: '1px solid #4f4f81' }}>
                        <h2 style={{marginTop: 0}}>Continue Your Game?</h2>
                        <p style={{color: '#e0e0e0', marginBottom: '25px'}}>You have an unfinished game session. Would you like to continue where you left off?</p>
                        <div style={{display: 'flex', justifyContent: 'center', gap: '15px'}}>
                            <button style={getButtonStyle()} onClick={() => {
                                if (pendingGameState) dispatch({ type: 'LOAD_STATE', payload: pendingGameState });
                                setShowContinuePrompt(false);
                                setPendingGameState(null);
                            }}>✅ Continue</button>
                            <button style={{...getButtonStyle(), background: '#555'}} onClick={() => {
                                dispatch({ type: 'RESET_GAME' });
                                setShowContinuePrompt(false);
                                setPendingGameState(null);
                            }}>🔁 Start New Game</button>
                        </div>
                    </div>
                </div>
            )}
            <div style={{...getMainContainerStyle(), maxWidth: '900px'}}>
                 {gameState.currentPhase === 'result' && (
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <button style={{...getButtonStyle(), fontSize: '1.2em', padding: '12px 24px'}} onClick={handleRestart}>🔁 Rematch</button>
                    </div>
                )}
                {!playerProfile || !opponentProfile ? <p style={{color: 'white', textAlign: 'center'}}>Loading player data...</p> :
                    (gameState.currentPhase === 'result') ?
                        <FinalResults scores={gameState.finalScore} onShare={handleShare} /> :
                        <>
                            <h1 style={getTitleStyle()}>1-on-1 RPG Session</h1>
                            <RPGGameGuide />
                            <ScriptLoader story={STORY_BACKGROUND} playerProfile={playerProfile} mission={missionData} />
                            <OpponentProfileCard opponentProfile={opponentProfile} />
                            <DialogueArea gameState={gameState} onSendMessage={handleSendMessage} onEndTurn={handleEndTurn} opponentProfile={opponentProfile} />
                            
                            {gameState.currentPhase !== 'finalDecision' && <SideQuestTracker mission={gameState.sideMissions.player1.find((m: SideMission) => m.round === gameState.round)} />}

                            {gameState.currentPhase === 'selectAction' && <ActionSelector onSelectAction={handleSelectAction} gameState={gameState} />}

                            {gameState.currentPhase === 'finalDecision' && <FinalChoiceSelector onSelectChoice={handleSelectFinalChoice} playerProfile={playerProfile} gameState={gameState} />}
                        </>
                }
            </div>
        </div>
    );
}
