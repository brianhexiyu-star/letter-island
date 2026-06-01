import { useState, useCallback, useEffect } from 'react';
import {
  Cursor, Button, Card, Footer, Time,
  Loading, Divider, Icon,
} from 'animal-island-ui';
import { playLetterChime, playType } from './useAudio';
import './App.css';

/* ── 信件数据 ── */
interface Letter {
  id: number;
  from: string;
  content: string;
  /** Animalese voice pitch factor (1.0 = neutral) */
  pitchFactor: number;
}

const LETTERS: Letter[] = [
  {
    id: 1,
    from: 'me',
    pitchFactor: 1.0,
    content: [
      'Hi Karthik',
      '',
      'it is weird to write a letter',
      '',
      'we become friends since a long time ago. I really appreciate your honesty and responsiblity in being a friend',
      '',
      'I remember that in our hang out, you always take care of the job of organizing events, reserving badminton court, and saying cold jokes to keep our conversation ongoing.',
      '',
      'thank you for the job you have done that might sometimes be unseen but really important.',
      '',
      'sincerely, by Brian',
    ].join('\n'),
  },
  {
    id: 2,
    from: 'me',
    pitchFactor: 0.85,
    content: [
      'hi Luke',
      '',
      'it is always weird to write a letter',
      '',
      'a few years ago, I was a person who was afraid of social situations, whether with strangers or friends. I really want to thank you for your recognition and encouragement that made me more confident to talk to people.',
      '',
      'I hope we can still be contacting after we graduate, mb through minecraft lmao',
      'if I able to build a server, pls join:)',
      '',
      'sincerely, by Brian',
    ].join('\n'),
  },
  {
    id: 3,
    from: 'me',
    pitchFactor: 0.95,
    content: [
      'hi Sewan',
      '',
      'although I just know you for a short time, I want to thank you for your persistence in talking with me when I usually don\'t talk much ',
      '',
      'I really appreciate your humor and patience, as well as your story narrative skills',
      '',
      'sincerely',
      'by Brian',
    ].join('\n'),
  },
  {
    id: 4,
    from: 'me',
    pitchFactor: 0.6,
    content: [
      'hi Caleb',
      '',
      'it has been a long time since we ever talked to each other. I really enjoy the time that we hang out and talk with each other.',
      '',
      'thank you for being my friend on the first place, I apologize for the time that I might have been very hurtful.',
      '',
      'sincerely,',
      'by Brian',
    ].join('\n'),
  },
  {
    id: 5,
    from: 'me',
    pitchFactor: 1.4,
    content: [
      'Happy birthday, Audrey! 🎉',
      '',
      'I hope this letter finds you well. ',
      '',
      'it is glad to see you become older and wiser. Compare to few years ago, you seem to have a more clear objective than before. I really appreciate your ability to work hard toward your goals.',
      '',
      'from that, you get more recognitions from others, and you met the friends who has the same goal as you. although I didn\'t contribute to that, I\'m happy to see that, and I know I could never do that like you.',
      '',
      'sincerely, hope you have a wonderful year ahead!',
      'by Brian',
    ].join('\n'),
  },
];

type PageView = 'home' | 'letter';

/* ── 浮动背景粒子配置 ── */
const PARTICLE_COUNT = 16;
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  size: 36 + Math.random() * 32,         // 36–68px
  left: 5 + Math.random() * 90,           // 5–95%
  startTop: 5 + Math.random() * 110,      // 5–115%
  delay: Math.random() * 10,              // 0–10s
  duration: 20 + Math.random() * 20,      // 20–40s
  drift: (Math.random() - 0.5) * 250,     // -125–125px
}));

export default function App() {
  const [view, setView] = useState<PageView>('home');
  const [loadingMounted, setLoadingMounted] = useState(false);
  const [loadingActive, setLoadingActive] = useState(false);
  const [activeLetter, setActiveLetter] = useState<Letter | null>(null);
  const params = new URLSearchParams(window.location.search);
  const recipientName = params.get('name');
  const iconEmoji = params.get('icon');
  const letterId = params.get('l');

  const isBirthday = recipientName === 'Audrey';
  const pageTitle = isBirthday ? '🎂 Happy birthday letter' : '😁 thank you letter';
  const pageSubtitle = isBirthday ? 'Happy Birthday!!!' : 'a letter assignment from senior seminar';

  const handleOpenLetter = useCallback(() => {
    playLetterChime();
    const letter = letterId
      ? LETTERS.find(l => l.id === parseInt(letterId))
      : undefined;
    setActiveLetter(letter || LETTERS[0]);

    // 1 — 加载遮罩出现，播放小岛动画
    setLoadingMounted(true);
    setLoadingActive(true);

    // 2 — 3秒后：关闭遮罩（径向圆形展开）+ 切换到信件页
    setTimeout(() => {
      setLoadingActive(false);
      setView('letter');
    }, 3000);

    // 3 — 遮罩关闭动画完成后移除遮罩
    setTimeout(() => {
      setLoadingMounted(false);
    }, 4200);
  }, []);

  /* ── 标题打字机效果 ── */
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let i = 0;
    let cursorTimeout: ReturnType<typeof setTimeout>;

    setDisplayedTitle('');
    setShowCursor(true);

    const interval = setInterval(() => {
      if (i < pageTitle.length) {
        setDisplayedTitle(pageTitle.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        cursorTimeout = setTimeout(() => setShowCursor(false), 2000);
      }
    }, 120);

    return () => {
      clearInterval(interval);
      clearTimeout(cursorTimeout);
    };
  }, []);

  /* ── 信件页打字机效果 ── */
  const [letterRevealed, setLetterRevealed] = useState(0);

  useEffect(() => {
    if (!activeLetter || view !== 'letter') return;
    setLetterRevealed(0);

    const segs: string[] = [
      '寄信人',
      activeLetter.from,
      activeLetter.content,
      '— ✦ —',
    ];
    const total = segs.reduce((s, seg) => s + seg.length + 1, 0) - 1;

    const pf = activeLetter.pitchFactor;

    const interval = setInterval(() => {
      setLetterRevealed(r => {
        if (r >= total) {
          clearInterval(interval);
          return total;
        }
        playType(pf);
        return r + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [activeLetter?.id, view]);

  const handleReadAnother = useCallback(() => {
    playLetterChime();
    setView('home');
    setActiveLetter(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* ── 信件页文本分段揭示辅助 ── */
  const letterSegs: string[] = [
    '寄信人',
    activeLetter?.from ?? '',
    activeLetter?.content ?? '',
    '— ✦ —',
  ];
  const segOffsets = letterSegs.map((_, i) => {
    let o = 0;
    for (let j = 0; j < i; j++) o += letterSegs[j].length + 1;
    return o;
  });
  const segTyped = letterSegs.map((seg, i) => {
    const off = segOffsets[i];
    if (letterRevealed <= off) return '';
    const chars = Math.min(letterRevealed - off, seg.length);
    return seg.slice(0, chars);
  });

  return (
    <Cursor>
      {/* ── 浮动蝴蝶背景 ── */}
      <div className="floating-bg" aria-hidden>
        {particles.map(p => (
          <div
            key={p.id}
            className="floating-particle"
            style={{
              '--drift': `${p.drift}px`,
              '--duration': `${p.duration}s`,
              '--delay': `${p.delay}s`,
              '--start-top': `${p.startTop}%`,
              '--start-left': `${p.left}%`,
            } as React.CSSProperties}
          >
            <Icon name="icon-critterpedia" size={p.size} />
          </div>
        ))}
      </div>

      {/* ── Loading 遮罩 ── */}
      {loadingMounted && (
        <div
          className="loading-overlay"
          style={{ pointerEvents: loadingActive ? 'auto' : 'none' }}
        >
          <Loading active={loadingActive} />
        </div>
      )}

      {/* ═══ 首页 ═══ */}
      {view === 'home' && (
        <div className="letter-page">
          <header className="header">
            <Time />
          </header>

          <main className="main home-layout">
            {/* 左栏：装饰面板（手机隐藏，笔记本显示） */}
            <Card color="app-green" className="home-decor">
              <div className="home-decor-body">
                <div className="home-decor-island">{iconEmoji || (recipientName ? '📬' : '🧑🏾')}</div>
                <div className="home-decor-title">To {recipientName || 'Karthik'}</div>
                <div className="home-decor-sub">thank you for being such a great friend!</div>
                <Divider type="line-teal" />
                <div className="home-decor-icons">
                  <Icon name="icon-camera" size={36} />
                  <Icon name="icon-map" size={36} />
                  <Icon name="icon-chat" size={36} />
                  <Icon name="icon-diy" size={36} />
                  <Icon name="icon-critterpedia" size={36} />
                  <Icon name="icon-miles" size={36} />
                </div>
                <p className="home-decor-desc">
                  
                </p>
              </div>
            </Card>

            {/* 右栏：主操作区 */}
            <Card color="app-blue" className="hero-box">
              <div className="hero-card">
                <h1 className="hero-title">
                  {displayedTitle}
                  {showCursor && <span className="typing-cursor">|</span>}
                </h1>
                <Divider type="wave-yellow" />
                <p className="hero-subtitle">
                  {pageSubtitle}
                  <br />
                  click the mailbox below to read the letter!
                </p>
              </div>

              <div className="action-card">
                <div className="action-inner">
                  <div className="mailbox-icon">
                    <Icon name="icon-chat" size={80} />
                  </div>
                  <p className="action-text">letter below</p>
                  <Button type="primary" size="large" className="open-btn" onClick={handleOpenLetter}>
                    ✉️ open letter
                  </Button>
                </div>
              </div>
            </Card>
          </main>

          <Footer type="tree" />
        </div>
      )}

      {/* ═══ 信件页 ═══ */}
      {view === 'letter' && activeLetter && (
        <div className="letter-page letter-page--standalone">
          <header className="header">
            <Time />
          </header>

          <main className="letter-page-main">
            <Card color="default" className="letter-card letter-card--standalone">
              {/* 寄信人 */}
              <div className="letter-header">
                <span className="letter-seal">😀</span>
                <div className="letter-meta">
                  <span className="letter-from-label">{segTyped[0] || '\u00A0'}</span>
                  <span className="letter-from-name">{segTyped[1] || '\u00A0'}</span>
                </div>
              </div>

              <Divider type="wave-yellow" />

              {/* 信件正文 */}
              <pre className="letter-content">{segTyped[2]}</pre>

              {segTyped[3] && <div className="letter-end">{segTyped[3]}</div>}
            </Card>

            <div className="letter-footer-actions">
              <Button type="primary" size="large" onClick={handleReadAnother}>
                📬 再看一封
              </Button>
            </div>
          </main>

          <Footer type="tree" />
        </div>
      )}
    </Cursor>
  );
}
