import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { parseExcel } from '../utils/excelParser';
import { parseCSVFile } from '../utils/csvParser';
import { fetchFromGoogleSheets, buildCsvUrl, DEFAULT_SHEET_URL } from '../utils/googleSheetsSync';
import { Participant, Round, RoundStatus, CHANNELS, EVENTS, Session } from '../types';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Upload, Users, Play, Lock, Eye, StopCircle, BarChart3, Trash2, ChevronRight, List, RefreshCw, History, PlusCircle, Cloud, Link } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const HostDashboard: React.FC = () => {
  const [participants, setParticipants] = useState<Omit<Participant, 'id'>[]>([]);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [voteCounts, setVoteCounts] = useState<{ [key: number]: number }>({ 0: 0, 1: 0, 2: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [activeParticipants, setActiveParticipants] = useState(0);
  const [roundHistory, setRoundHistory] = useState<Round[]>([]); // 投票历史
  const [currentSession, setCurrentSession] = useState<Session | null>(null); // 当前活动
  const [posterMode, setPosterMode] = useState(false);
  const [sheetUrl, setSheetUrl] = useState(DEFAULT_SHEET_URL); // Google Sheets URL
  const [isSyncing, setIsSyncing] = useState(false); // 是否正在同步
  const [timerMinutes, setTimerMinutes] = useState(2);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const lockingRef = useRef(false);

  // Function to fetch vote counts from database
  const fetchVoteCounts = async (roundId: string) => {
    const { data, error } = await supabase
      .from('votes')
      .select('option_index')
      .eq('round_id', roundId);
    
    if (error) {
      console.error('Error fetching votes:', error);
      return { 0: 0, 1: 0, 2: 0 };
    }
    
    const counts = { 0: 0, 1: 0, 2: 0 };
    data?.forEach(vote => {
      if (vote.option_index >= 0 && vote.option_index <= 2) {
        counts[vote.option_index as keyof typeof counts]++;
      }
    });
    return counts;
  };

  // 获取所有 rounds 的历史记录
  const fetchRoundHistory = async () => {
    const { data } = await supabase
      .from('rounds')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) {
      setRoundHistory(data);
    }
  };

  // 从 Google Sheets 同步数据
  const syncFromGoogleSheets = async () => {
    setIsSyncing(true);
    try {
      const csvUrl = buildCsvUrl(sheetUrl);
      console.log('Fetching from:', csvUrl);
      const data = await fetchFromGoogleSheets(csvUrl);
      
      if (data.length === 0) {
        toast.error('没有找到有效的参与者数据，请检查 Sheet 中是否有数据');
        return;
      }
      
      setParticipants(data);
      toast.success(`成功从 Google Sheets 同步 ${data.length} 位参与者！`);
    } catch (error) {
      console.error('Sync error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('需要公开访问') || errorMessage.includes('403')) {
        toast.error(
          'Google Sheets 需要公开访问权限。\n请将 Sheet 设为"任何拥有链接的人都可以查看"',
          { duration: 5000 }
        );
      } else {
        toast.error(`同步失败: ${errorMessage.substring(0, 100)}`, { duration: 5000 });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // 开始新活动（清除所有数据，从 Google Sheets 拉取最新数据）
  const startNewSession = async () => {
    if (!confirm('确定要开始新活动吗？这将结束当前所有投票轮次，并从 Google Sheets 拉取最新数据。')) return;
    
    setIsLoading(true);
    
    // 1. 结束所有进行中的 rounds
    await supabase
      .from('rounds')
      .update({ status: RoundStatus.COMPLETED })
      .in('status', ['PENDING', 'VOTING', 'LOCKED', 'REVEALED']);
    
    // 2. 清除当前状态
    setCurrentRound(null);
    setVoteCounts({ 0: 0, 1: 0, 2: 0 });
    setActiveParticipants(0);
    
    // 3. 广播清除
    await supabase.channel(CHANNELS.GAME).send({
      type: 'broadcast',
      event: EVENTS.ROUND_UPDATE,
      payload: null
    });
    
    // 4. 从 Google Sheets 拉取最新数据
    try {
      const csvUrl = buildCsvUrl(sheetUrl);
      const data = await fetchFromGoogleSheets(csvUrl);
      
      if (data.length > 0) {
        setParticipants(data);
        toast.success(`新活动已开始！已同步 ${data.length} 位参与者。`);
      } else {
        toast.success('新活动已开始！请手动导入参与者数据。');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.success('新活动已开始！同步数据失败，请手动导入。');
    }
    
    // 5. 刷新历史
    await fetchRoundHistory();
    
    setIsLoading(false);
  };

  // Fetch current active round and participants from database on load
  useEffect(() => {
    const fetchActiveRound = async () => {
      // 获取当前活动
      const { data: activeSession } = await supabase
        .from('sessions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (activeSession) {
        setCurrentSession(activeSession);
        setPosterMode(activeSession.poster_mode ?? false);
        
        // 获取当前活动的参与者
        const { data: sessionParticipants } = await supabase
          .from('participants')
          .select('*')
          .eq('session_id', activeSession.id)
          .order('created_at', { ascending: true });
        
        if (sessionParticipants) {
          const formatted = sessionParticipants.map(p => ({
            name: p.name,
            statement_1: p.statement_1,
            statement_2: p.statement_2,
            statement_3: p.statement_3,
            lie_index: p.lie_index
          }));
          setParticipants(formatted);
        }
        
        // 获取当前活动的轮次
        const { data } = await supabase
          .from('rounds')
          .select('*')
          .eq('session_id', activeSession.id)
          .in('status', ['PENDING', 'VOTING', 'LOCKED', 'REVEALED'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (data) {
          setCurrentRound(data);
          const counts = await fetchVoteCounts(data.id);
          setVoteCounts(counts);
        }
      }
    };
    fetchActiveRound();
    fetchRoundHistory();
  }, []);

  // Subscribe to Realtime votes and database changes
  useEffect(() => {
    if (!currentRound) {
      setVoteCounts({ 0: 0, 1: 0, 2: 0 });
      return;
    }

    // Initial fetch
    fetchVoteCounts(currentRound.id).then(setVoteCounts);
    
    // Listen to round status changes from database
    const roundsChannel = supabase
      .channel('host-rounds-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'rounds', filter: `id=eq.${currentRound.id}` },
        async (payload) => {
          const updatedRound = payload.new as Round;
          setCurrentRound(updatedRound);
        }
      )
      .subscribe();

    // Listen to broadcast events for real-time updates
    const channel = supabase
      .channel(CHANNELS.GAME)
      .on('broadcast', { event: EVENTS.NEW_VOTE }, (response) => {
        const payload = response.payload as { option_index: number };
        if (payload && typeof payload.option_index === 'number') {
            setVoteCounts(prev => ({
            ...prev,
            [payload.option_index]: (prev[payload.option_index] || 0) + 1
            }));
        }
      })
      .subscribe();

    // Also listen to database changes for votes (more reliable)
    const votesChannel = supabase
      .channel('host-votes-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'votes' },
        async (payload) => {
          if (payload.new.round_id === currentRound.id) {
            // Refresh vote counts from database for accuracy
            const counts = await fetchVoteCounts(currentRound.id);
            setVoteCounts(counts);
          }
        }
      )
      .subscribe();

    // Track active participants (users who have voted or are connected)
    const countActiveParticipants = async () => {
      if (!currentRound) return;
      // Count unique users who have voted in this round
      const { data, error } = await supabase
        .from('votes')
        .select('user_session_id', { count: 'exact', head: false })
        .eq('round_id', currentRound.id);
      
      if (!error && data) {
        const uniqueUsers = new Set(data.map(v => v.user_session_id));
        setActiveParticipants(uniqueUsers.size);
      }
    };
    
    // Count active participants periodically
    const interval = setInterval(countActiveParticipants, 2000);
    countActiveParticipants();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(roundsChannel);
      clearInterval(interval);
    };
  }, [currentRound?.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsLoading(true);
      try {
        let data;
        // 根据文件扩展名选择解析器
        if (file.name.endsWith('.csv')) {
          data = await parseCSVFile(file);
        } else {
          data = await parseExcel(file);
        }
        
        // 获取当前活动 ID（如果没有，创建一个默认活动）
        let sessionId = currentSession?.id;
        if (!sessionId) {
          // 创建或获取默认活动
          const { data: defaultSession, error: sessionError } = await supabase
            .from('sessions')
            .select('id')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (sessionError || !defaultSession) {
            // 创建新活动
            const { data: newSession, error: createError } = await supabase
              .from('sessions')
              .insert({ name: `Session ${new Date().toLocaleString()}` })
              .select()
              .single();
            
            if (createError || !newSession) {
              throw new Error('无法创建活动，请先开始新活动');
            }
            sessionId = newSession.id;
            setCurrentSession(newSession);
          } else {
            sessionId = defaultSession.id;
          }
        }
        
        // 同步到 Supabase
        // 先删除当前活动的旧参与者（可选：如果你想保留历史数据，可以注释掉这部分）
        await supabase
          .from('participants')
          .delete()
          .eq('session_id', sessionId);
        
        // 批量插入新参与者
        const participantsToInsert = data.map(p => ({
          name: p.name,
          statement_1: p.statement_1,
          statement_2: p.statement_2,
          statement_3: p.statement_3,
          lie_index: p.lie_index,
          session_id: sessionId
        }));
        
        const { error: insertError } = await supabase
          .from('participants')
          .insert(participantsToInsert);
        
        if (insertError) {
          console.error('Supabase insert error:', insertError);
          throw new Error(`同步到数据库失败: ${insertError.message}`);
        }
        
        // 从 Supabase 重新获取参与者（确保数据一致）
        const { data: syncedParticipants, error: fetchError } = await supabase
          .from('participants')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });
        
        if (fetchError) {
          console.error('Supabase fetch error:', fetchError);
          // 即使获取失败，也使用本地数据
          setParticipants(data);
        } else if (syncedParticipants) {
          // 转换为本地格式
          const formatted = syncedParticipants.map(p => ({
            name: p.name,
            statement_1: p.statement_1,
            statement_2: p.statement_2,
            statement_3: p.statement_3,
            lie_index: p.lie_index
          }));
          setParticipants(formatted);
        } else {
        setParticipants(data);
        }
        
        toast.success(`成功导入并同步 ${data.length} 位参与者到 Supabase！`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '导入失败';
        toast.error(`导入失败: ${errorMessage}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const createRound = async (p: Omit<Participant, 'id'>) => {
    setIsLoading(true);
    try {
      // 确保存在 session（活动）
      let sessionId = currentSession?.id;
      if (!sessionId) {
        const { data: activeSession } = await supabase
          .from('sessions')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (activeSession) {
          sessionId = activeSession.id;
          setCurrentSession(activeSession);
        } else {
          const { data: newSession, error: sessionErr } = await supabase
            .from('sessions')
            .insert({ name: `Session ${new Date().toLocaleString()}` })
            .select()
            .single();
          if (sessionErr || !newSession) {
            throw new Error('无法创建活动，请先开始新活动');
          }
          sessionId = newSession.id;
          setCurrentSession(newSession);
        }
      }

    // Shuffle options logic
    const optionsRaw = [p.statement_1, p.statement_2, p.statement_3];
    const originalLieIndex = p.lie_index;
    
    const indices = [0, 1, 2].sort(() => Math.random() - 0.5);
    const shuffledOptions = indices.map(i => optionsRaw[i]);
    const newLieIndex = indices.indexOf(originalLieIndex);

    const newRound: Round = {
      id: crypto.randomUUID(),
      participant_id: 'temp-id',
      participant_name: p.name,
      options: shuffledOptions,
      correct_option_index: newLieIndex,
      status: RoundStatus.PENDING,
      created_at: new Date().toISOString(),
      votes: { 0: 0, 1: 0, 2: 0 }
    };

      // Save to Supabase，附带 session_id
      const { error: insertError } = await supabase.from('rounds').insert([{ 
        id: newRound.id,
        participant_name: newRound.participant_name,
        options: newRound.options,
        correct_option_index: newRound.correct_option_index,
          status: RoundStatus.PENDING,
          session_id: sessionId
    }]);
      if (insertError) throw insertError;

    setCurrentRound(newRound);
    setVoteCounts({ 0: 0, 1: 0, 2: 0 });
    
    // Broadcast Round Start
    await supabase.channel(CHANNELS.GAME).send({
      type: 'broadcast',
      event: EVENTS.ROUND_UPDATE,
      payload: newRound
    });

      toast.success("Round sent to screen! Participants can now vote.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : '创建轮次失败';
      toast.error(msg);
      console.error(err);
    } finally {
    setIsLoading(false);
    }
  };

  // 倒计时与超时自动锁票
  useEffect(() => {
    if (!currentRound || !currentRound.voting_ends_at || currentRound.status !== RoundStatus.VOTING) {
      setRemainingSeconds(null);
      return;
    }

    const updateRemaining = () => {
      const diffMs = new Date(currentRound.voting_ends_at!).getTime() - Date.now();
      const secs = Math.max(0, Math.floor(diffMs / 1000));
      setRemainingSeconds(secs);
      if (secs <= 0 && !lockingRef.current) {
        lockingRef.current = true;
        updateStatus(RoundStatus.LOCKED).finally(() => {
          lockingRef.current = false;
        });
      }
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [currentRound?.id, currentRound?.status, currentRound?.voting_ends_at]);

  // 监听 sessions 表的 poster_mode 变化
  useEffect(() => {
    const sessionChannel = supabase
      .channel('host-session-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        (payload) => {
          if (currentSession && payload.new && payload.new.id === currentSession.id) {
            setPosterMode(!!payload.new.poster_mode);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
    };
  }, [currentSession?.id]);

  const startTimer = async () => {
    if (!currentRound || currentRound.status !== RoundStatus.PENDING) return;
    const durationMs = Math.max(5 * 1000, (timerMinutes * 60 + timerSeconds) * 1000);
    const endsAt = new Date(Date.now() + durationMs).toISOString();

    const { error } = await supabase
      .from('rounds')
      .update({ status: RoundStatus.VOTING, voting_ends_at: endsAt })
      .eq('id', currentRound.id);

    if (error) {
      toast.error('Failed to start timer');
      console.error(error);
      return;
    }

    const updatedRound: Round = {
      ...currentRound,
      status: RoundStatus.VOTING,
      voting_ends_at: endsAt,
    };

    setCurrentRound(updatedRound);

    // Broadcast Round Start with timer
    await supabase.channel(CHANNELS.GAME).send({
      type: 'broadcast',
      event: EVENTS.ROUND_UPDATE,
      payload: updatedRound
    });

    toast.success('Voting started with timer!');
  };

  // 取消倒计时，恢复到开始前状态
  const cancelTimer = async () => {
    if (!currentRound || currentRound.status !== RoundStatus.VOTING) return;
    setIsLoading(true);
    try {
      const { data: updatedRound, error } = await supabase
        .from('rounds')
        .update({ status: RoundStatus.PENDING, voting_ends_at: null })
        .eq('id', currentRound.id)
        .select()
        .single();

      if (error) throw error;

      const newRoundState: Round = {
        ...currentRound,
        status: RoundStatus.PENDING,
        voting_ends_at: null,
      };
      setCurrentRound(newRoundState);
      setRemainingSeconds(null);

      // Broadcast revert
      await supabase.channel(CHANNELS.GAME).send({
        type: 'broadcast',
        event: EVENTS.ROUND_UPDATE,
        payload: newRoundState,
      });

      toast.success('Timer cancelled, back to pending.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '取消倒计时失败';
      toast.error(msg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePosterMode = async () => {
    if (!currentSession) {
      toast.error('No active session');
      return;
    }
    const next = !posterMode;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ poster_mode: next })
        .eq('id', currentSession.id);
      if (error) throw error;

      setPosterMode(next);

      // Broadcast poster toggle (for immediate effect)
      await supabase.channel(CHANNELS.GAME).send({
        type: 'broadcast',
        event: EVENTS.POSTER_TOGGLE,
        payload: { poster_mode: next }
      });

      toast.success(next ? '已切换到海报模式' : '已退出海报模式');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '切换海报模式失败';
      toast.error(msg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (status: RoundStatus) => {
    if (!currentRound) return;

    if (status === RoundStatus.COMPLETED) {
        // Update database first
        await supabase.from('rounds').update({ status: RoundStatus.COMPLETED }).eq('id', currentRound.id);
        // Clear round
        setCurrentRound(null);
        await supabase.channel(CHANNELS.GAME).send({
            type: 'broadcast',
            event: EVENTS.ROUND_UPDATE,
            payload: null 
        });
        toast.success("Round completed!");
        return;
    }

    // Update database first (source of truth)
    const { data: updatedRound, error } = await supabase
      .from('rounds')
      .update({ status })
      .eq('id', currentRound.id)
      .select()
      .single();
    
    if (error) {
      toast.error("Failed to update round status");
      console.error(error);
      return;
    }

    if (updatedRound) {
      const updated = { ...currentRound, ...updatedRound, status };
      setCurrentRound(updated);
      
      // Broadcast to all clients
    await supabase.channel(CHANNELS.GAME).send({
      type: 'broadcast',
      event: EVENTS.ROUND_UPDATE,
      payload: updated
    });
      
      toast.success(`Round status updated to ${status}`);
    }
  };

  const totalVotes = (Object.values(voteCounts) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-ui-100 p-6 font-sans">
      <header className="flex flex-col gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-ui-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src="/spark-logo.jpg" alt="Stanford Sparks" className="w-12 h-12 rounded-lg shadow-sm" />
              <div>
                <h1 className="text-2xl font-bold text-ui-900">Host Control Center</h1>
                <p className="text-ui-500 text-sm">Manage the flow of the event</p>
              </div>
            </div>
          <div className="flex gap-3">
               <Button
                  onClick={startNewSession}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
               >
                  <PlusCircle size={16} className="mr-2" /> 开始新活动
               </Button>
               <Button
                  onClick={syncFromGoogleSheets}
                  disabled={isSyncing}
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
               >
                  <Cloud size={16} className="mr-2" /> {isSyncing ? '同步中...' : '同步 Google Sheets'}
               </Button>
             <label className="cursor-pointer">
                  <input type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFileUpload} />
                <div className="bg-ui-900 text-white hover:bg-black px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition text-sm">
                      <Upload size={16} /> Import Excel/CSV
                </div>
             </label>
            </div>
          </div>
          
          {/* Google Sheets URL 输入 */}
          <div className="flex gap-2 items-center">
            <Link size={16} className="text-ui-400" />
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="Google Sheets URL"
              className="flex-1 px-3 py-2 border border-ui-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-stanford"
            />
          </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Participant List */}
            <div className="lg:col-span-4 h-[calc(100vh-10rem)] flex flex-col space-y-4">
                <Card className="flex-1 flex flex-col overflow-hidden">
                    <CardHeader className="bg-ui-50 border-b border-ui-200 py-4">
                        <CardTitle><span className="flex items-center gap-2 text-lg"><Users size={18}/> Participants ({participants.length})</span></CardTitle>
                    </CardHeader>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2 bg-white">
                        {participants.length === 0 && (
                            <div className="text-center py-10 text-ui-400 text-sm">
                                Import an Excel file to see participants here.
                            </div>
                        )}
                        {participants.map((p, idx) => {
                            const isActive = currentRound?.participant_name === p.name;
                            return (
                                <div key={idx} 
                                     className={`p-3 rounded-lg border-2 cursor-pointer group transition-all flex justify-between items-center ${
                                       isActive 
                                         ? 'border-stanford bg-red-50 shadow-md' 
                                         : 'border-ui-100 hover:border-stanford hover:bg-red-50'
                                     }`}
                                 onClick={() => createRound(p)}>
                                    <div className="flex-1">
                                        <div className={`font-semibold ${isActive ? 'text-stanford' : 'text-ui-800 group-hover:text-stanford'}`}>
                                            {p.name}
                                            {isActive && <span className="ml-2 text-xs bg-stanford text-white px-2 py-0.5 rounded">LIVE</span>}
                                        </div>
                                    <div className="text-xs text-ui-400">3 Statements</div>
                                    </div>
                                    {isActive ? (
                                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                                    ) : (
                                        <ChevronRight size={16} className="text-ui-300 group-hover:text-stanford" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Right: Active Round Control */}
            <div className="lg:col-span-8 space-y-6">
                {currentRound ? (
                    <Card className="border-t-4 border-t-stanford bg-white shadow-md">
                        <CardContent>
                            {/* Status Bar */}
                            <div className="flex justify-between items-center mb-6 pb-6 border-b border-ui-100">
                                <div>
                                    <div className="text-xs font-bold text-stanford uppercase tracking-wider mb-1">Live on Screen</div>
                                    <div className="text-3xl font-bold text-ui-900">{currentRound.participant_name}</div>
                                </div>
                                <div className="text-right space-y-2">
                                    <div>
                                    <div className="text-sm font-medium text-ui-500 mb-1">Total Votes</div>
                                    <div className="text-2xl font-mono font-bold text-ui-900">{totalVotes}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-ui-500 mb-1">Active Participants</div>
                                        <div className="text-xl font-mono font-bold text-stanford">{activeParticipants}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Timer Settings */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-ui-700">Timer</span>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min={0}
                                            value={timerMinutes}
                                            onChange={(e) => setTimerMinutes(Math.max(0, parseInt(e.target.value || '0')))}
                                            className="w-16 px-2 py-1 border rounded-lg text-sm"
                                        />
                                        <span className="text-sm text-ui-500">分</span>
                                        <input
                                            type="number"
                                            min={0}
                                            max={59}
                                            value={timerSeconds}
                                            onChange={(e) => setTimerSeconds(Math.min(59, Math.max(0, parseInt(e.target.value || '0'))))}
                                            className="w-16 px-2 py-1 border rounded-lg text-sm"
                                        />
                                        <span className="text-sm text-ui-500">秒</span>
                                    </div>
                                </div>
                                {currentRound.status === RoundStatus.VOTING && remainingSeconds !== null && (
                                  <div className="text-sm font-semibold text-stanford">
                                    倒计时：{Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, '0')}
                                  </div>
                                )}
                            </div>

                            {/* Control Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <Button 
                                    onClick={startTimer}
                                    disabled={currentRound.status !== RoundStatus.PENDING}
                                    className={`w-full h-16 text-lg ${currentRound.status === RoundStatus.VOTING ? 'ring-2 ring-offset-2 ring-stanford' : ''}`}
                                >
                                    <Play size={20} className="mr-2" /> Start Timer
                                </Button>
                                
                                <Button 
                                    onClick={cancelTimer}
                                    disabled={currentRound.status !== RoundStatus.VOTING}
                                    variant="secondary"
                                    className="w-full h-16 text-lg"
                                >
                                    <StopCircle size={20} className="mr-2" /> Cancel Timer
                                </Button>

                                <Button 
                                    onClick={togglePosterMode}
                                    variant={posterMode ? "destructive" : "outline"}
                                    className="w-full h-16 text-lg"
                                >
                                    {posterMode ? '退出海报模式' : '显示海报'}
                                </Button>
                                
                                <Button 
                                    onClick={() => updateStatus(RoundStatus.LOCKED)}
                                    disabled={currentRound.status !== RoundStatus.VOTING}
                                    variant="secondary"
                                    className="w-full h-16 text-lg"
                                >
                                    <Lock size={20} className="mr-2" /> Lock Vote
                                </Button>

                                <Button 
                                    onClick={() => updateStatus(RoundStatus.REVEALED)}
                                    disabled={currentRound.status !== RoundStatus.LOCKED}
                                    variant="outline"
                                    className="w-full h-16 text-lg border-2"
                                >
                                    <Eye size={20} className="mr-2" /> Reveal
                                </Button>

                                <Button 
                                    onClick={() => updateStatus(RoundStatus.COMPLETED)}
                                    variant="destructive"
                                    className="w-full h-16 text-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                >
                                    <StopCircle size={20} className="mr-2" /> End Round
                                </Button>
                            </div>
                            
                            {/* Next Round Button */}
                            {participants.length > 0 && (
                                <div className="mb-4">
                                    <Button 
                                        onClick={() => {
                                            const currentIndex = participants.findIndex(p => p.name === currentRound.participant_name);
                                            const nextIndex = (currentIndex + 1) % participants.length;
                                            createRound(participants[nextIndex]);
                                        }}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        <ChevronRight size={20} className="mr-2" /> Next Participant
                                    </Button>
                                </div>
                            )}

                            {/* Mini Stats Preview */}
                            <div className="bg-ui-50 rounded-xl p-6">
                                <h3 className="text-sm font-semibold text-ui-500 mb-4 flex items-center"><BarChart3 size={16} className="mr-2"/> Live Vote Distribution (Host Only)</h3>
                                <div className="space-y-3">
                                    {currentRound.options.map((opt, i) => {
                                        const count = voteCounts[i] || 0;
                                        const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                                        const isCorrect = i === currentRound.correct_option_index;
                                        return (
                                            <div key={i} className="flex items-center gap-4">
                                                <div className="w-8 text-sm font-mono text-ui-500">#{i + 1}</div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-ui-700'}`}>
                                                            {opt} {isCorrect && "(LIE)"}
                                                        </span>
                                                        <span className="font-bold">{count}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-ui-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-500 ${isCorrect && currentRound.status === RoundStatus.REVEALED ? 'bg-green-500' : 'bg-stanford'}`} 
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-ui-300 rounded-xl bg-ui-50/50">
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                            <Users size={32} className="text-ui-400" />
                        </div>
                        <h2 className="text-xl font-bold text-ui-800 mb-2">Ready for the next round</h2>
                        <p className="text-ui-500 max-w-md">
                            Select a participant from the list on the left to initialize the screen and start the voting process.
                        </p>
                        <div className="mt-8 text-sm text-ui-400 bg-white px-4 py-2 rounded border border-ui-200">
                            The Big Screen is currently showing the QR Code.
                        </div>
                    </div>
                )}

                {/* 投票历史记录 */}
                <Card className="mt-6">
                    <CardHeader className="bg-ui-50 border-b border-ui-200 py-4">
                        <CardTitle>
                            <span className="flex items-center gap-2 text-lg">
                                <History size={18}/> 投票历史记录 ({roundHistory.length})
                                <Button 
                                    onClick={fetchRoundHistory} 
                                    variant="outline" 
                                    className="ml-auto h-8 px-2"
                                >
                                    <RefreshCw size={14} />
                                </Button>
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {roundHistory.length === 0 ? (
                            <div className="text-center py-8 text-ui-400">
                                暂无投票记录
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {roundHistory.map((r, idx) => (
                                    <div 
                                        key={r.id} 
                                        className={`p-3 rounded-lg border flex justify-between items-center ${
                                            r.status === RoundStatus.COMPLETED 
                                                ? 'border-ui-200 bg-ui-50' 
                                                : 'border-stanford bg-red-50'
                                        }`}
                                    >
                                        <div>
                                            <div className="font-semibold text-ui-800">{r.participant_name}</div>
                                            <div className="text-xs text-ui-400">
                                                {new Date(r.created_at).toLocaleString('zh-CN')}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                r.status === RoundStatus.COMPLETED 
                                                    ? 'bg-gray-200 text-gray-700' 
                                                    : r.status === RoundStatus.VOTING 
                                                        ? 'bg-green-100 text-green-700'
                                                        : r.status === RoundStatus.REVEALED 
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {r.status === RoundStatus.COMPLETED ? '已完成' 
                                                    : r.status === RoundStatus.VOTING ? '投票中'
                                                    : r.status === RoundStatus.REVEALED ? '已揭示'
                                                    : r.status === RoundStatus.LOCKED ? '已锁定'
                                                    : '待开始'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
      </div>
    </div>
  );
};