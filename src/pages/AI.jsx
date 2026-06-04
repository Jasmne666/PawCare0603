import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DeepSeekKeyPanel from '../components/DeepSeekKeyPanel.jsx';
import PetSwitcher from '../components/PetSwitcher.jsx';
import { useAiConversations } from '../hooks/useAiConversations.js';
import { usePets } from '../hooks/usePets.js';
import { useRecentHealthLogs } from '../hooks/useRecentHealthLogs.js';
import { useSevenDayHealthLogCount } from '../hooks/useSevenDayHealthLogCount.js';
import { getDeepSeekApiKey } from '../lib/deepseek.js';

const quickPrompts = [
  '分析近期整体健康',
  '评估饮食是否均衡',
  '这些症状需要就医吗',
  '现在适合做绝育手术吗',
  '情绪低落怎么改善',
];

function EmptyState({ petName }) {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-6 text-center">
      <div className="text-5xl">🐾</div>
      <h2 className="mt-4 font-title text-xl font-semibold">{petName}的专属健康顾问</h2>
      <p className="mt-2 text-sm leading-6 text-paw-muted">
        点击快捷问题，或输入任何关于健康、饮食、行为的问题。
      </p>
    </section>
  );
}

function NoPetCard() {
  return (
    <section className="rounded-card border border-paw-border bg-paw-card p-5">
      <p className="text-sm font-medium text-paw-muted">AI 健康顾问</p>
      <h1 className="mt-2 font-title text-3xl font-semibold">请先创建宠物档案</h1>
      <p className="mt-3 text-sm leading-6 text-paw-muted">AI 需要宠物档案和健康记录作为上下文。</p>
      <Link
        className="mt-5 inline-flex rounded-control bg-paw-primary px-4 py-3 text-sm font-semibold text-paw-background"
        to="/profile"
      >
        去创建档案
      </Link>
    </section>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[82%] whitespace-pre-wrap rounded-card px-4 py-3 text-sm leading-6 ${
          isUser
            ? 'bg-paw-primary text-paw-background'
            : 'border border-paw-border bg-paw-card text-paw-secondary'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

function AI() {
  const location = useLocation();
  const endRef = useRef(null);
  const sentInitialRef = useRef(false);
  const { activePetId, loading: petLoading, pet, pets, selectPet } = usePets();
  const { loading: logLoading, logs } = useRecentHealthLogs(pet?.id, 7);
  const { count: sevenDayLogCount } = useSevenDayHealthLogCount(pet?.id);
  const { error, loading: messageLoading, messages, sendMessage, sending } = useAiConversations(pet?.id);
  const [hasDeepSeekKey, setHasDeepSeekKey] = useState(Boolean(getDeepSeekApiKey()));
  const [input, setInput] = useState('');
  const [localError, setLocalError] = useState('');

  const send = useCallback(async (value) => {
    const question = (value || input).trim();
    if (!question || sending) return;

    setInput('');
    setLocalError('');

    try {
      await sendMessage(question, pet, logs);
    } catch (err) {
      setLocalError(err.message);
    }
  }, [input, logs, pet, sendMessage, sending]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    const initialQuestion = location.state?.initialQuestion;
    if (!initialQuestion || sentInitialRef.current || !pet || logLoading || messageLoading) return;

    sentInitialRef.current = true;
    send(initialQuestion);
  }, [location.state, logLoading, messageLoading, pet, send]);

  if (petLoading) {
    return (
      <section className="rounded-card border border-paw-border bg-paw-card p-5">
        <p className="text-sm font-medium text-paw-muted">AI</p>
        <h1 className="mt-2 font-title text-3xl font-semibold">正在读取宠物数据</h1>
      </section>
    );
  }

  if (!pet) return <NoPetCard />;

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-4">
      <section>
        <p className="text-sm font-medium text-paw-muted">AI</p>
        <h1 className="mt-2 font-title text-3xl font-semibold">健康顾问</h1>
        <p className="mt-2 text-sm text-paw-muted">基于{pet.name}的档案和最近健康记录回答。</p>
      </section>

      <PetSwitcher activePetId={activePetId} label="AI 分析对象" onSelectPet={selectPet} pets={pets} />

      {hasDeepSeekKey && (
        <section className="rounded-control border border-paw-healthy/30 bg-paw-healthy/10 px-4 py-3 text-[11px] font-semibold text-paw-healthy">
          ✓ 已读取{pet.name}近7天记录 · {sevenDayLogCount}条数据
        </section>
      )}

      <DeepSeekKeyPanel onKeySaved={() => setHasDeepSeekKey(Boolean(getDeepSeekApiKey()))} petName={pet.name} variant="ai" />

      {(localError || error) && (
        <section className="rounded-card border border-paw-danger bg-paw-danger/10 p-4 text-sm text-paw-danger">
          {localError || error}
        </section>
      )}

      <div
        className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1 pr-10 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {quickPrompts.map((prompt) => (
          <button
            className="shrink-0 rounded-full border border-paw-border bg-paw-card px-4 py-2 text-xs font-semibold text-paw-secondary"
            key={prompt}
            onClick={() => send(prompt)}
            type="button"
          >
            {prompt}
          </button>
        ))}
        <span className="block w-px shrink-0" />
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {!messageLoading && !messages.length && <EmptyState petName={pet.name} />}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-card border border-paw-border bg-paw-card px-4 py-3 text-sm text-paw-muted">
              正在分析...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-24 flex gap-2 border-t border-paw-border bg-paw-background/95 pt-3">
        <input
          className="min-w-0 flex-1 rounded-card border border-paw-border bg-paw-card px-4 py-3 text-sm outline-none focus:border-paw-healthy"
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') send();
          }}
          placeholder={`询问关于${pet.name}的健康问题`}
          value={input}
        />
        <button
          className="rounded-card bg-paw-primary px-5 py-3 text-sm font-semibold text-paw-background disabled:opacity-60"
          disabled={sending}
          onClick={() => send()}
          type="button"
        >
          发送
        </button>
      </div>
    </div>
  );
}

export default AI;
