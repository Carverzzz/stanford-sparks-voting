import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Round, RoundStatus, CHANNELS, EVENTS } from '../types';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const ParticipantView: React.FC = () => {
  const [round, setRound] = useState<Round | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Generate unique session ID for this user (persist in localStorage)
  const [userSessionId] = useState(() => {
    const stored = localStorage.getItem('user_session_id');
    if (stored) return stored;
    const newId = `user-${crypto.randomUUID()}`;
    localStorage.setItem('user_session_id', newId);
    return newId;
  });

  useEffect(() => {
    // 1. Check for current active round on load
    const fetchActiveRound = async () => {
        const { data } = await supabase
            .from('rounds')
            .select('*')
            .in('status', ['PENDING', 'VOTING', 'LOCKED', 'REVEALED'])
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        if (data) {
            setRound(data);
            // Check if user already voted in this round
            const { data: existingVote } = await supabase
              .from('votes')
              .select('option_index')
              .eq('round_id', data.id)
              .eq('user_session_id', userSessionId)
              .single();
            
            if (existingVote) {
              setHasVoted(true);
              setSelectedOption(existingVote.option_index);
            }
        }
    };
    fetchActiveRound();

    // 2. Listen for real-time updates
    const channel = supabase
      .channel(CHANNELS.GAME)
      .on('broadcast', { event: EVENTS.ROUND_UPDATE }, ({ payload }) => {
        const newRound = payload as Round | null;
        setRound(newRound);
        
        // Reset state if it's a new round or null
        if (!newRound || (round && newRound.id !== round.id)) {
            setHasVoted(false);
            setSelectedOption(null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [round?.id]);

  const handleVote = async (index: number) => {
    if (hasVoted || !round || round.status !== RoundStatus.VOTING) return;
    
    // Immediate visual feedback
    setSelectedOption(index);
    setHasVoted(true);

    try {
      // Persist vote first (database is source of truth)
      const { error } = await supabase.from('votes').insert({
          round_id: round.id,
          option_index: index,
          user_session_id: userSessionId
      });
      
      if (error) {
        // If duplicate vote (user already voted)
        if (error.code === '23505') {
          console.log('User already voted in this round');
          // Reset UI state since vote already exists
          setHasVoted(true);
          return;
        } else {
          console.error('Error submitting vote:', error);
          // Reset on error so user can retry
          setHasVoted(false);
          setSelectedOption(null);
          return;
        }
      }

      // Send broadcast event for real-time updates (non-blocking)
      supabase.channel(CHANNELS.GAME).send({
        type: 'broadcast',
        event: EVENTS.NEW_VOTE,
        payload: { option_index: index, round_id: round.id }
      }).catch(err => {
        // Broadcast failure is not critical, database is source of truth
        console.warn('Broadcast failed (non-critical):', err);
      });
    } catch (err) {
      console.error('Unexpected error:', err);
      setHasVoted(false);
      setSelectedOption(null);
    }
  };

  if (!round || round.status === RoundStatus.COMPLETED) {
    return (
      <div className="min-h-screen bg-ui-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 animate-pulse">
            <Loader2 className="text-stanford" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-ui-900">You're all set!</h2>
        <p className="text-ui-500 mt-2 text-lg">Watch the big screen.<br/>Voting options will appear here automatically.</p>
      </div>
    );
  }

  const isLocked = round.status === RoundStatus.LOCKED || round.status === RoundStatus.REVEALED;
  const isRevealed = round.status === RoundStatus.REVEALED;

  return (
    <div className="min-h-screen bg-ui-50 p-4 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        
        {/* Header */}
        <div className="text-center space-y-1 my-6">
            <h3 className="text-xs font-bold tracking-widest text-stanford uppercase">Spot the Lie</h3>
            <h1 className="text-3xl font-extrabold text-ui-900">{round.participant_name}</h1>
        </div>

        {/* Status Bar */}
        <div className="flex justify-center mb-8 h-8">
             {round.status === RoundStatus.VOTING && (
                 <motion.span 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center px-4 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700 shadow-sm"
                 >
                     <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                     VOTING OPEN
                 </motion.span>
             )}
             {isLocked && !isRevealed && (
                 <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-bold bg-gray-200 text-gray-700">
                     VOTING LOCKED
                 </span>
             )}
        </div>

        {/* Options */}
        <div className="space-y-4 flex-1">
            {round.options.map((option, idx) => {
                let stateStyles = "bg-white border-ui-200 shadow-sm"; 
                let textStyles = "text-ui-800";
                
                if (hasVoted) {
                    if (selectedOption === idx) {
                        stateStyles = "bg-ui-900 border-ui-900 shadow-md ring-2 ring-offset-2 ring-ui-900";
                        textStyles = "text-white";
                    } else {
                        stateStyles = "bg-ui-50 border-transparent opacity-50";
                        textStyles = "text-ui-400";
                    }
                }

                if (isRevealed) {
                    if (idx === round.correct_option_index) {
                        // The Truth (Wait, game is find the Lie, so this is the correct answer)
                        stateStyles = "bg-green-500 border-green-600 shadow-lg scale-105";
                        textStyles = "text-white";
                    } else if (selectedOption === idx && idx !== round.correct_option_index) {
                        stateStyles = "bg-red-500 border-red-600 opacity-100";
                        textStyles = "text-white";
                    } else {
                        stateStyles = "bg-ui-100 border-transparent opacity-40";
                        textStyles = "text-ui-400 grayscale";
                    }
                }

                return (
                    <motion.button
                        key={idx}
                        whileTap={{ scale: hasVoted || isLocked ? 1 : 0.95 }}
                        whileHover={!hasVoted && !isLocked ? { scale: 1.02, y: -2 } : {}}
                        onClick={() => handleVote(idx)}
                        disabled={hasVoted || isLocked}
                        className={`w-full p-6 text-lg font-medium text-left rounded-xl border-2 transition-all duration-300 relative overflow-hidden ${stateStyles} ${
                          !hasVoted && !isLocked ? 'cursor-pointer hover:shadow-lg' : 'cursor-not-allowed'
                        }`}
                    >
                        {/* Animated background on selection */}
                        {hasVoted && selectedOption === idx && !isRevealed && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute inset-0 bg-gradient-to-r from-stanford/20 to-stanford/10"
                            />
                        )}
                        
                        <span className={`relative z-10 leading-snug flex items-center justify-between ${textStyles}`}>
                            <span>{option}</span>
                            {hasVoted && selectedOption === idx && !isRevealed && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                >
                                    <CheckCircle2 className="text-white" size={28} />
                                </motion.div>
                            )}
                        </span>
                        
                        {/* Selection indicator */}
                        {hasVoted && selectedOption === idx && !isRevealed && (
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 0.3 }}
                                className="absolute bottom-0 left-0 h-1 bg-white/50"
                            />
                        )}
                        
                        {isRevealed && idx === round.correct_option_index && (
                             <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute right-0 top-0 bg-white/20 px-3 py-1 rounded-bl-xl text-xs font-bold text-white uppercase tracking-wider"
                             >
                                 The Lie
                             </motion.div>
                        )}
                    </motion.button>
                )
            })}
        </div>

        {/* Footer Message */}
        <div className="h-16 flex items-center justify-center text-center pb-6">
            {hasVoted && !isLocked && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ui-400 text-sm font-medium">
                    Vote cast. Waiting for results...
                </motion.p>
            )}
            {isRevealed && selectedOption === round.correct_option_index && (
                <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-green-600 font-bold flex items-center gap-2">
                    <CheckCircle2 size={18}/> You guessed it!
                </motion.p>
            )}
            {isRevealed && selectedOption !== null && selectedOption !== round.correct_option_index && (
                <motion.p initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-red-500 font-bold flex items-center gap-2">
                    <AlertCircle size={18}/> Oops, that was true!
                </motion.p>
            )}
        </div>
      </div>
    </div>
  );
};