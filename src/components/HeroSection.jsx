// ════════════════════════════════════════════════════════════════════════════
// HeroSection.jsx — Main chat interface (ChatPage)
// ════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { parseAIText } from '../utils/textParser';
import { STAGE, AGE, CATEGORIES_BY_AGE, MOODS_BY_AGE, LANGUAGES } from '../constants';
import SearchModal from './SearchModal';

// ─────────────────────────── LESSON 6 START ──────────────────────────────
// Optimizing the UX and Finalizing the Project
// Goal   : Add MovieStrip to chat so AI replies show poster cards.
// Output : After each AI reply, a scrollable row of movie posters appears.
import MovieStrip from './MovieStrip';
// ─────────────────────────── LESSON 6 END ────────────────────────────────

function TypingDots() {
  return (
    <div className="chat-row bot-row">
      <div className="bot-avatar"><i className="bi bi-stars" /></div>
      <div className="bubble bot-bubble">
        <div className="typing-dots"><span /><span /><span /></div>
      </div>
    </div>
  );
}

function SpecialContent({ content }) {
  const { addMsg, switchAge } = useApp();
  const [cats,  setCats]  = useState([]);
  const [langs, setLangs] = useState(['Any Language']);
  const { type } = content;

  // ─────────────────────────── LESSON 6 START ──────────────────────────────
  if (type === 'movie-strip') return <MovieStrip movies={content.movies} />;
  // ─────────────────────────── LESSON 6 END ────────────────────────────────

  if (type === 'mood-greeting') return (
    <div className="choice-row">
      {[['Great day!','Having a great day!'],['Meh day','Just a meh day'],['Rescue me!','I need a movie to rescue me!']]
        .map(([label, val]) => (
          <button key={val} className="choice-btn" onClick={() => content.onSelect(val)}>{label}</button>
        ))}
      {content.enableTyping && <button className="choice-btn type-btn" onClick={content.enableTyping}>Type</button>}
    </div>
  );

  if (type === 'age-picker') return (
    <div className="choice-row">
      {[[AGE.KIDS,'Kids','Under 13'],[AGE.TEEN,'Teen','13-17'],[AGE.ADULT,'Adult','18+']]
        .map(([age, label, sub]) => (
          <button key={age} className="choice-btn" onClick={() => content.onSelect(age)}>
            {label} <span className="choice-sub">{sub}</span>
          </button>
        ))}
    </div>
  );

  if (type === 'category-picker') {
    const items = CATEGORIES_BY_AGE[content.age] || CATEGORIES_BY_AGE.adult;
    return (
      <div>
        <div className="category-grid">
          {items.map(c => (
            <button key={c.id}
              className={`category-btn ${cats.includes(c.id) ? 'selected' : ''}`}
              onClick={() => setCats(p => p.includes(c.id) ? p.filter(x => x !== c.id) : [...p, c.id])}>
              {c.label}
            </button>
          ))}
        </div>
        <button className="confirm-btn" disabled={!cats.length} onClick={() => content.onConfirm(cats)}>
          Let's find your movies!
        </button>
      </div>
    );
  }

  if (type === 'mood-picker') {
    const moods = content.age === AGE.KIDS ? MOODS_BY_AGE.kids : MOODS_BY_AGE.other;
    return (
      <div className="choice-row">
        {moods.map(m => (
          <button key={m.value} className="choice-btn" onClick={() => content.onSelect(m.value)}>{m.label}</button>
        ))}
        {content.enableTyping && <button className="choice-btn type-btn" onClick={content.enableTyping}>Type</button>}
      </div>
    );
  }

  if (type === 'language-picker') {
    const toggle = lang => {
      if (lang === 'Any Language') { setLangs(['Any Language']); return; }
      setLangs(prev => {
        const without = prev.filter(l => l !== 'Any Language');
        const next = prev.includes(lang) ? without.filter(l => l !== lang) : [...without, lang];
        return next.length ? next : ['Any Language'];
      });
    };
    return (
      <div>
        <div className="category-grid">
          {LANGUAGES.map(lang => (
            <button key={lang}
              className={`category-btn ${langs.includes(lang) ? 'selected' : ''}`}
              onClick={() => toggle(lang)}>
              {lang}
            </button>
          ))}
        </div>
        <button className="confirm-btn" disabled={!langs.length} onClick={() => content.onConfirm(langs)}>
          Let's go!
        </button>
      </div>
    );
  }

  if (type === 'age-switch-offer') return (
    <div className="choice-row">
      <button className="choice-btn" onClick={() => switchAge(AGE.TEEN)}>Switch to Teen</button>
      <button className="choice-btn" onClick={() => switchAge(AGE.ADULT)}>Switch to Adult</button>
      <button className="choice-btn" onClick={() => addMsg('user', 'Keep Kids mode')}>Stay Kids</button>
    </div>
  );

  return null;
}

function ChatRow({ msg, onMovieClick }) {
  const isBot = msg.role === 'bot';
  const { content } = msg;
  if (content?.type) return (
    <div className="chat-row bot-row">
      <div className="bot-avatar"><i className="bi bi-stars" /></div>
      <div className="bubble bot-bubble interactive-bubble"><SpecialContent content={content} /></div>
    </div>
  );
  return (
    <div className={`chat-row ${isBot ? 'bot-row' : 'user-row'}`}>
      {isBot && <div className="bot-avatar"><i className="bi bi-stars" /></div>}
      <div className={`bubble ${isBot ? 'bot-bubble' : 'user-bubble'}`}>
        {typeof content === 'string' ? parseAIText(content, onMovieClick) : content}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const {
    stage, setStage, chatMsgs, addMsg, isBotTyping, setIsBotTyping,
    userName, setUserName, userAge, setUserAge, userMood, setUserMood,
    userCategories, setUserCategories, setUserLanguage,
    callAI, callAIWithSearch, searchForStrip, switchAge, isRestricted,
  } = useApp();

  const [inputVal,    setInputVal]    = useState('');
  const [inputActive, setInputActive] = useState(false);
  const [placeholder, setPlaceholder] = useState('Type your name to begin...');
  const [showSearch,  setShowSearch]  = useState(false);

  const msgsEndRef  = useRef(null);
  const welcomeSent = useRef(false);

  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs, isBotTyping]);

  useEffect(() => {
    if (stage !== STAGE.NAME || chatMsgs.length > 0) return;
    welcomeSent.current = false;
    const t = setTimeout(() => {
      if (welcomeSent.current) return;
      welcomeSent.current = true;
      setInputActive(false); setInputVal(''); setPlaceholder('Type your name to begin...');
      addMsg('bot', "Welcome to CineVerse! 🎬 I'm CineBot, your personal AI movie companion. What should I call you?");
      setInputActive(true);
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, chatMsgs.length]);

  async function handleNameSubmit(name) {
    const first = name.trim().split(' ')[0];
    setUserName(first); setInputActive(false); addMsg('user', name.trim());
    setStage(STAGE.GREET_MOOD); setIsBotTyping(true);
    try { addMsg('bot', await callAI(`The user's name is ${first}. Greet them warmly with 1 sentence and use 1-2 emojis. Then ask how they're feeling today.`)); }
    catch { addMsg('bot', `Nice to meet you, ${first}! 😊 How are you feeling today?`); }
    finally { setIsBotTyping(false); }
    addMsg('bot', { type: 'mood-greeting', onSelect: handleGreetingMood,
      enableTyping: () => { setInputActive(true); setPlaceholder('Tell me how you feel...'); } });
  }

  async function handleGreetingMood(mood) {
    addMsg('user', mood); setInputActive(false); setStage(STAGE.AGE); setIsBotTyping(true);
    try { addMsg('bot', await callAI(`${userName} said: "${mood}". Respond with 1 warm empathetic sentence using 1 emoji, then ask for their age group.`)); }
    catch { addMsg('bot', 'Got it! 😄 How old are you?'); } finally { setIsBotTyping(false); }
    addMsg('bot', { type: 'age-picker', onSelect: handleAgeSelect });
  }

  function handleAgeSelect(age) {
    setUserAge(age);
    addMsg('user', { kids: 'Kids (Under 13)', teen: 'Teen (13-17)', adult: 'Adult (18+)' }[age]);
    setStage(STAGE.CATEGORIES);
    addMsg('bot', 'Great! 🎭 Pick the genres you love');
    addMsg('bot', { type: 'category-picker', age, onConfirm: handleCategoriesConfirm });
  }

  function handleCategoriesConfirm(cats) {
    const allCats = Object.values(CATEGORIES_BY_AGE).flat();
    addMsg('user', `I love: ${cats.map(c => allCats.find(x => x.id === c)?.label || c).join(', ')}`);
    setUserCategories(cats); setStage(STAGE.MOVIE_MOOD);
    addMsg('bot', "Fantastic taste! 🍿 What's your vibe right now?");
    addMsg('bot', { type: 'mood-picker', age: userAge, onSelect: handleMoodSelect,
      enableTyping: () => { setInputActive(true); setPlaceholder('What mood are you in?'); } });
  }

  function handleMoodSelect(mood) {
    setUserMood(mood); addMsg('user', mood); setStage(STAGE.LANGUAGE);
    addMsg('bot', 'Love it! 🌍 Last thing — what language do you prefer?');
    addMsg('bot', { type: 'language-picker', onConfirm: handleLanguageConfirm });
  }

  async function handleLanguageConfirm(langs) {
    setUserLanguage(langs);
    addMsg('user', langs.includes('Any Language') ? 'Any language' : langs.join(', '));
    setStage(STAGE.CHAT); setPlaceholder(`Ask me anything, ${userName || 'friend'}...`);
    setInputActive(true); setIsBotTyping(true);
    try {
      const lc = langs.includes('Any Language') ? 'any language' : langs.join(' or ');
      const prompt = userAge === AGE.KIDS
        ? `Recommend 3 great G/PG animated family movies for a child under 13. Language: ${lc}. Genres: ${userCategories.join(', ')}.`
        : userAge === AGE.TEEN
        ? `Recommend 3 great PG/PG-13 movies for a teenager. Language: ${lc}. Mood: "${userMood}". Genres: ${userCategories.join(', ')}.`
        : `Recommend 3 great movies in ${lc} for mood: "${userMood}" and genres: ${userCategories.join(', ')}.`;
      const { reply, movieResults } = await callAIWithSearch(prompt);
      addMsg('bot', reply || 'Here are some picks for you!');
      // ─────────────────────────── LESSON 6 START ──────────────────────────
      if (movieResults.length) addMsg('bot', { type: 'movie-strip', movies: movieResults });
      // ─────────────────────────── LESSON 6 END ────────────────────────────
    } catch { addMsg('bot', 'Something went wrong. Try asking me directly!'); }
    finally { setIsBotTyping(false); }
  }

  async function handleSend() {
    const msg = inputVal.trim();
    if (!msg || isBotTyping) return;
    setInputVal('');
    if (stage === STAGE.NAME)       { handleNameSubmit(msg); return; }
    if (stage === STAGE.GREET_MOOD) { setInputActive(false); addMsg('user', msg); handleGreetingMood(msg); return; }
    if (stage !== STAGE.CHAT)       return;
    if (isRestricted(msg))          { addMsg('bot', 'Please ask me about movies only! 🎬'); return; }
    addMsg('user', msg); setInputActive(false); setIsBotTyping(true);
    try {
      const { reply, movieResults, hasAgeSwitchOffer } = await callAIWithSearch(msg);
      addMsg('bot', reply || 'Let me think... try asking again!');
      // ─────────────────────────── LESSON 6 START ──────────────────────────
      if (movieResults.length) addMsg('bot', { type: 'movie-strip', movies: movieResults });
      if (hasAgeSwitchOffer)   addMsg('bot', { type: 'age-switch-offer' });
      // ─────────────────────────── LESSON 6 END ────────────────────────────
    } catch { addMsg('bot', 'Something went wrong. Try again!'); }
    finally { setIsBotTyping(false); setInputActive(true); }
  }

  const CHIPS = {
    'Hidden gems':         'What are some underrated hidden gem movies?',
    'Latest movies':       'Recommend great movies from the last 2 years.',
    'Something different': 'Recommend something completely different.',
    'Top picks':           'What are your top movie picks right now?',
  };

  async function handleChip(chip) {
    addMsg('user', chip); setIsBotTyping(true);
    try {
      const { reply, movieResults } = await callAIWithSearch(CHIPS[chip]);
      addMsg('bot', reply || 'Here are my picks!');
      // ─────────────────────────── LESSON 6 START ──────────────────────────
      if (movieResults.length) addMsg('bot', { type: 'movie-strip', movies: movieResults });
      // ─────────────────────────── LESSON 6 END ────────────────────────────
    } finally { setIsBotTyping(false); }
  }

  // ─────────────────────────── LESSON 6 START ──────────────────────────────
  // renderMsg — passes onMovieClick so **bold** titles become clickable chips
  function renderMsg(msg) {
    return (
      <ChatRow key={msg.id} msg={msg} onMovieClick={async title => {
        addMsg('user', `Tell me more about "${title}"`);
        setInputActive(false); setIsBotTyping(true);
        try {
          const [ai, direct] = await Promise.all([
            callAIWithSearch(`Tell me about "${title}" — description, why it's great, and 2 similar recommendations.`),
            searchForStrip(title).catch(() => []),
          ]);
          addMsg('bot', ai.reply || `"${title}" is a great pick!`);
          const strip = ai.movieResults?.length ? ai.movieResults : direct.slice(0, 6);
          if (strip.length) addMsg('bot', { type: 'movie-strip', movies: strip });
        } catch { addMsg('bot', `Let me find "${title}" for you!`); }
        finally { setIsBotTyping(false); setInputActive(true); }
      }} />
    );
  }
  // ─────────────────────────── LESSON 6 END ────────────────────────────────

  return (
    <div className="chat-page">

      <div className="chat-header-bar">
        <div className="d-flex align-items-center gap-3">
          <div className="chat-bot-avatar"><i className="bi bi-stars" /></div>
          <div>
            <div className="chat-bot-name">CineBot</div>
            <div className="ai-status"><span className="ai-status-dot" />Your AI Movie Guide</div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          {stage === STAGE.CHAT && (
            <div className="age-mode-bar">
              {[[AGE.KIDS,'🔥','Trending'],[AGE.TEEN,'🎞️','Nostalgic'],[AGE.ADULT,'⭐','Popular']].map(([key, emoji, label]) => (
                <button key={key}
                  className={`age-mode-btn ${userAge === key ? `active active-${key}` : ''}`}
                  onClick={() => switchAge(key)}>
                  <span className="age-emoji">{emoji}</span>
                  <span className="age-label">{label}</span>
                </button>
              ))}
            </div>
          )}
          <button className="search-icon-btn" onClick={() => setShowSearch(true)}
            aria-label="Search movies" title="Search movies">
            <i className="bi bi-search" />
          </button>
          <span className="live-pill"><span className="live-dot" />Live AI</span>
        </div>
      </div>

      <div className="chat-messages-area">
        {chatMsgs.map(renderMsg)}
        {isBotTyping && <TypingDots />}
        <div ref={msgsEndRef} />
      </div>

      {stage === STAGE.CHAT && !isBotTyping && (
        <div className="chat-chips">
          {Object.keys(CHIPS).map(c => (
            <button key={c} className="ai-suggestion-chip" onClick={() => handleChip(c)}>{c}</button>
          ))}
        </div>
      )}

      <div className="chat-input-bar">
        <input type="text" className="chat-text-input"
          placeholder={placeholder} value={inputVal}
          disabled={!inputActive || isBotTyping}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          autoComplete="off" />
        <button className="send-btn" onClick={handleSend}
          disabled={!inputActive || isBotTyping || !inputVal.trim()}
          aria-label="Send">
          <i className="bi bi-send-fill" />
        </button>
      </div>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

    </div>
  );
}
