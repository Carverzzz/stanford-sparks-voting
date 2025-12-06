import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Round, RoundStatus, CHANNELS, EVENTS } from '../types';
import { LiveChart } from '../components/LiveChart';
import { Countdown } from '../components/Countdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

export const DisplayView: React.FC = () => {
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [votes, setVotes] = useState<{ [key: number]: number }>({ 0: 0, 1: 0, 2: 0 });
  const [activeParticipants, setActiveParticipants] = useState(0); // 活跃参与人数
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);

  // Get current hostname for QR code
  const [joinUrl, setJoinUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 二维码直接指向根路径，会自动进入投票界面
      const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
      setJoinUrl(url);
      // Use QR Server API with better error handling
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&color=1d1d1f&bgcolor=ffffff&margin=2&data=${encodeURIComponent(url)}`);
    }
  }, []);

  // Function to fetch vote counts from database
  const fetchVoteCounts = async (roundId: string) => {
    const { data, error } = await supabase
      .from('votes')
      .select('option_index, user_session_id')
      .eq('round_id', roundId);
    
    if (error) {
      console.error('Error fetching votes:', error);
      return { 0: 0, 1: 0, 2: 0 };
    }
    
    const counts = { 0: 0, 1: 0, 2: 0 };
    const uniqueUsers = new Set<string>();
    
    data?.forEach(vote => {
      if (vote.option_index >= 0 && vote.option_index <= 2) {
        counts[vote.option_index as keyof typeof counts]++;
        uniqueUsers.add(vote.user_session_id);
      }
    });
    
    setActiveParticipants(uniqueUsers.size);
    return counts;
  };

  // 从数据库获取当前活跃的 round
  const checkActiveRound = async () => {
      const { data } = await supabase
          .from('rounds')
          .select('*')
          .in('status', ['PENDING', 'VOTING', 'LOCKED', 'REVEALED'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
      
      if (data) {
          setCurrentRound(data);
          // Fetch existing votes from database
          const counts = await fetchVoteCounts(data.id);
          setVotes(counts);
      } else {
          // 没有活跃的 round
          setCurrentRound(null);
          setVotes({ 0: 0, 1: 0, 2: 0 });
          setActiveParticipants(0);
      }
  };

  // Listen for updates
  useEffect(() => {
    // 1. 初始加载
    checkActiveRound();

    // 2. 监听 broadcast 事件
    const channel = supabase
      .channel(CHANNELS.GAME)
      .on('broadcast', { event: EVENTS.ROUND_UPDATE }, async ({ payload }) => {
        const newRound = payload as Round | null;
        setCurrentRound(newRound);
        if (!newRound) {
            setVotes({ 0: 0, 1: 0, 2: 0 });
            setActiveParticipants(0);
        } else if (!currentRound || newRound.id !== currentRound.id) {
            setVotes({ 0: 0, 1: 0, 2: 0 });
            const counts = await fetchVoteCounts(newRound.id);
            setVotes(counts);
        }
      })
      .on('broadcast', { event: EVENTS.NEW_VOTE }, ({ payload }) => {
        if (payload && typeof payload.option_index === 'number' && currentRound) {
            setVotes(prev => ({
            ...prev,
            [payload.option_index]: (prev[payload.option_index] || 0) + 1
            }));
        }
      })
      .subscribe();

    // 3. 监听 rounds 表变化（更可靠）
    const roundsChannel = supabase
      .channel('display-rounds-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rounds' },
        async () => {
          // 当 rounds 表有任何变化时，重新获取当前活跃的 round
          await checkActiveRound();
        }
      )
      .subscribe();

    // 4. 监听 votes 表变化
    const votesChannel = supabase
      .channel('display-votes-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'votes' },
        async (payload) => {
          if (currentRound && payload.new.round_id === currentRound.id) {
            const counts = await fetchVoteCounts(currentRound.id);
            setVotes(counts);
          }
        }
      )
      .subscribe();

    // 5. 定期轮询作为备份（每2秒）
    const pollInterval = setInterval(checkActiveRound, 2000);

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(roundsChannel);
      supabase.removeChannel(votesChannel);
      clearInterval(pollInterval);
    };
  }, [currentRound?.id]);

  // 初始化倒计时（仅在 VOTING 时）
  useEffect(() => {
    if (currentRound?.status === RoundStatus.VOTING && currentRound.voting_ends_at) {
      const tick = () => {
        const secs = Math.max(0, Math.floor((new Date(currentRound.voting_ends_at!).getTime() - Date.now()) / 1000));
        setCountdownSeconds(secs);
      };
      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    } else {
      setCountdownSeconds(null);
    }
  }, [currentRound?.id, currentRound?.status, currentRound?.voting_ends_at]);

  const totalVotes = (Object.values(votes) as number[]).reduce((a, b) => a + b, 0);
  const chartData = currentRound ? currentRound.options.map((opt, i) => ({
    name: opt,
    votes: votes[i] || 0,
    index: i
  })) : [];

  // IDLE STATE: QR CODE
  if (!currentRound) {
      return (
          <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                  <div className="inline-block p-6 bg-white border-4 border-ui-100 rounded-3xl shadow-xl">
                      <img src={qrCodeUrl} alt="Scan to Join" className="w-[400px] h-[400px] rounded-xl" />
                  </div>
                  <div className="space-y-4">
                      <h1 className="text-6xl font-extrabold text-ui-900 tracking-tight">Scan to Vote</h1>
                      <p className="text-3xl text-ui-500 font-medium">Join the interactive poll now</p>
                      <div className="text-xl text-stanford font-mono mt-4 bg-ui-50 py-2 px-6 rounded-lg inline-block">
                          {joinUrl}
                      </div>
                  </div>
              </motion.div>
          </div>
      );
  }

  const lieText = currentRound.options[currentRound.correct_option_index];
  const showAnswer = currentRound.status === RoundStatus.REVEALED;

  // ACTIVE ROUND STATE
  return (
    <div className="min-h-screen bg-ui-50 p-4 md:p-6 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-start border-b border-ui-200 pb-4 gap-4">
            <div className="space-y-1">
                <h2 className="text-lg font-bold text-stanford uppercase tracking-wider">Two Truths & One Lie</h2>
                <h1 className="text-3xl md:text-4xl font-extrabold text-ui-900 tracking-tight leading-tight">{currentRound.participant_name}</h1>
            </div>
            <div className="flex gap-3">
                <div className="bg-white px-4 py-2 rounded-xl border border-ui-200 shadow-sm text-center min-w-[110px]">
                    <div className="text-2xs font-bold text-ui-400 uppercase tracking-wider">Total Votes</div>
                    <div className="text-3xl font-mono font-bold text-ui-900">{totalVotes}</div>
                </div>
                <div className="bg-stanford/10 px-4 py-2 rounded-xl border border-stanford/20 shadow-sm text-center min-w-[110px]">
                    <div className="text-2xs font-bold text-stanford uppercase tracking-wider">Active</div>
                    <div className="text-2xl font-mono font-bold text-stanford">{activeParticipants}</div>
                </div>
            </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col mt-6 gap-4">
            
            {/* Status / Countdown / Reveal */}
            <div className="flex flex-col items-center gap-2 min-h-[60px]">
                <AnimatePresence mode="wait">
                    {currentRound.status === RoundStatus.VOTING && countdownSeconds !== null ? (
                        <motion.div 
                            key="countdown"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white px-4 py-2 rounded-full border border-ui-200 shadow-sm text-sm font-mono font-bold text-stanford"
                        >
                            倒计时：{Math.floor(countdownSeconds / 60)}:{String(countdownSeconds % 60).padStart(2, '0')}
                        </motion.div>
                    ) : showAnswer ? (
                         <motion.div 
                            key="revealed"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-stanford text-white px-5 py-2 rounded-full text-base md:text-lg font-bold shadow-lg flex items-center gap-2"
                        >
                            <Trophy size={20} /> THE LIE: {lieText}
                        </motion.div>
                    ) : currentRound.status === RoundStatus.LOCKED ? (
                        <motion.div 
                            key="locked"
                            className="bg-ui-800 text-white px-5 py-2 rounded-full text-sm md:text-base font-bold"
                        >
                            VOTING CLOSED
                        </motion.div>
                    ) : (
                        <div className="text-ui-400 text-sm md:text-base font-medium">Waiting for host...</div>
                    )}
                </AnimatePresence>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-[320px] bg-white rounded-2xl shadow-lg border border-ui-100 p-4 md:p-6 relative overflow-hidden">
                <LiveChart 
                    data={chartData} 
                    totalVotes={totalVotes}
                    activeParticipants={activeParticipants}
                    showAnswer={showAnswer}
                    highlightIndex={currentRound.correct_option_index}
                />
                
                {/* Vote Progress Indicator */}
                {activeParticipants > 0 && (
                    <div className="absolute top-3 right-3 bg-ui-900/80 text-white px-3 py-2 rounded-lg text-xs font-bold">
                        {totalVotes} / {activeParticipants} 已投票
                        {activeParticipants > 0 && (
                            <div className="text-2xs font-normal mt-1 opacity-75">
                                {Math.round((totalVotes / activeParticipants) * 100)}% 完成率
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Instructions Footer */}
            <div className="text-center text-ui-400 text-sm md:text-base font-medium">
                Identify the statement that is a <span className="text-stanford font-bold">LIE</span>.
            </div>
        </div>
    </div>
  );
};