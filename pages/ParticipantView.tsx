import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Round, RoundStatus, CHANNELS, EVENTS } from '../types';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const ParticipantView: React.FC = () => {
  const [round, setRound] = useState<Round | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [posterMode, setPosterMode] = useState(false);
  
  // Generate unique session ID for this user (persist in localStorage)
  const [userSessionId] = useState(() => {
    const stored = localStorage.getItem('user_session_id');
    if (stored) return stored;
    const newId = `user-${crypto.randomUUID()}`;
    localStorage.setItem('user_session_id', newId);
    return newId;
  });

  // 从数据库获取当前活跃的 round
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
        } else {
          setHasVoted(false);
          setSelectedOption(null);
        }
    } else {
        // 没有活跃的 round
        setRound(null);
        setHasVoted(false);
        setSelectedOption(null);
    }
  };

  useEffect(() => {
    // 1. 初始加载
    fetchActiveRound();

    // 2. 监听 broadcast 事件（实时更新）
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

    // 3. 监听数据库变化（更可靠）
    const dbChannel = supabase
      .channel('participant-rounds-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rounds' },
        async (payload) => {
          // 当 rounds 表有任何变化时，重新获取当前活跃的 round
          await fetchActiveRound();
        }
      )
      .subscribe();

    // 4. 定期轮询作为备份（每3秒）
    const pollInterval = setInterval(fetchActiveRound, 3000);

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(dbChannel);
      clearInterval(pollInterval);
    };
  }, [userSessionId]);

  // 监听 session poster_mode 变化 + 初始化
  useEffect(() => {
    const fetchSessionPoster = async () => {
      const { data } = await supabase
        .from('sessions')
        .select('poster_mode')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (data) setPosterMode(!!(data as any).poster_mode);
    };
    fetchSessionPoster();

    const sessionChannel = supabase
      .channel('participant-session-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        (payload) => {
          const newRow: any = (payload as any).new;
          if (newRow?.is_active) {
            setPosterMode(!!newRow.poster_mode);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
    };
  }, []);

  // 倒计时显示 & 到期后本地禁用投票
  useEffect(() => {
    if (round?.status === RoundStatus.VOTING && round.voting_ends_at) {
      const updateRemaining = () => {
        const secs = Math.max(0, Math.floor((new Date(round.voting_ends_at!).getTime() - Date.now()) / 1000));
        setCountdownSeconds(secs);
        setIsExpired(secs <= 0);
      };
      updateRemaining();
      const interval = setInterval(updateRemaining, 1000);
      return () => clearInterval(interval);
    } else {
      setCountdownSeconds(null);
      setIsExpired(false);
    }
  }, [round?.id, round?.status, round?.voting_ends_at]);

  const handleVote = async (index: number) => {
    if (hasVoted || !round || round.status !== RoundStatus.VOTING || isExpired) return;
    
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

  if (posterMode) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <img src="/poster-mobile.png" alt="Poster" className="max-h-screen max-w-screen object-contain rounded-2xl shadow-2xl" />
      </div>
    );
  }

  if (!round || round.status === RoundStatus.COMPLETED) {
    return (
      <div className="min-h-screen bg-ui-50 flex flex-col items-center justify-center p-6 text-center">
        <img src="/spark-logo.jpg" alt="Stanford Sparks" className="w-20 h-20 rounded-xl shadow-sm mb-4" />
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 animate-pulse">
            <Loader2 className="text-stanford" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-ui-900">You're all set!</h2>
        <p className="text-ui-500 mt-2 text-lg">Watch the big screen.<br/>Voting options will appear here automatically.</p>
      </div>
    );
  }

  const isLocked = round.status === RoundStatus.LOCKED || round.status === RoundStatus.REVEALED || isExpired;
  const isRevealed = round.status === RoundStatus.REVEALED;

  return (
    <div className="min-h-screen bg-ui-50 p-4 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-center gap-3 my-6">
            <img src="/spark-logo.jpg" alt="Stanford Sparks" className="w-12 h-12 rounded-lg shadow-sm" />
            <div className="text-center space-y-1">
                <h3 className="text-xs font-bold tracking-widest text-stanford uppercase">Spot the Lie</h3>
                <h1 className="text-3xl font-extrabold text-ui-900">{round.participant_name}</h1>
            </div>
        </div>

        {/* Status Bar */}
        <div className="flex justify-center mb-8 h-8">
             {round.status === RoundStatus.VOTING && (
                 <motion.span 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center px-4 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700 shadow-sm"
                 >
                     <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                     {isExpired ? 'TIME UP' : 'VOTING OPEN'}
                 </motion.span>
             )}
             {isLocked && !isRevealed && (
                 <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-bold bg-gray-200 text-gray-700">
                     VOTING LOCKED
                 </span>
             )}
        </div>

        {/* Countdown */}
        {round.status === RoundStatus.VOTING && countdownSeconds !== null && (
          <div className="text-center text-lg font-mono font-bold text-stanford mb-4">
            剩余时间：{Math.floor(countdownSeconds / 60)}:{String(countdownSeconds % 60).padStart(2, '0')}
          </div>
        )}

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