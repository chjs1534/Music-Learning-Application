import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import '../styles/sheetMusicStyles.css';

const SheetMusic: React.FC = () => {
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [musicSheets, setMusicSheets] = useState<Array<{ id: number, name: string, instrument: string, thumbnail: string, pdfUrl: string }>>([]);
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedInstrument, setSelectedInstrument] = useState('All');

    useEffect(() => {
        const storedDarkMode = localStorage.getItem('darkMode');
        if (storedDarkMode === 'enabled') {
            setIsDarkMode(true);
            document.body.classList.add('dark-mode');
        } else {
            setIsDarkMode(false);
            document.body.classList.remove('dark-mode');
        }
        setToken(localStorage.getItem('token'));
        setUserId(localStorage.getItem('id'));

        setMusicSheets([
            { id: 1, name: 'Mary Had a Little Lamb', instrument: 'Piano', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/1c0405ac8a1dea93cfe08ac0fb3cf59faee1736d/score_0.png@260x364?no-cache=1715691221&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://makingmusicfun.net/public/assets/pdf/sheet_music/mary-had-a-little-lamb-piano.pdf' },
            { id: 2, name: 'Für Elise', instrument: 'Piano', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/09522325f13e23685a5ea3615ab2d6b76e94cd1d/score_0.png@260x364?no-cache=1715693264&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.mfiles.co.uk/scores/fur-elise.pdf' },
            { id: 3, name: 'Canon in D', instrument: 'Violin', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/0dcae27e61f49614c999dd5f152e8d3c625c1b8b/score_0.png@260x364?no-cache=1715687777&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.musictheoryacademy.com/wp-content/uploads/2021/01/Pachelbel-Canon-in-D-piano-sheet-music.pdf' },
            { id: 4, name: 'Moonlight Sonata', instrument: 'Piano', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/16ddf165fa7aa36cc14d75a7d7b5f7ec03bbad9f/score_0.png@260x364?no-cache=1715688210&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.mfiles.co.uk/scores/moonlight-sonata.pdf' },
            { id: 5, name: 'Clair de Lune', instrument: 'Piano', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/3f4624bc6d4c62be09f6808fb2ea69506a6fed32/score_0.png@260x364?no-cache=1715695526&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.mfiles.co.uk/scores/clair-de-lune.pdf' },
            { id: 6, name: 'The Entertainer', instrument: 'Piano', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/b0d9d152c2da48e6aa92401c847d1410cba0726e/score_0.png@260x364?no-cache=1715687748&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.mfiles.co.uk/scores/the-entertainer.pdf' },
            { id: 7, name: 'Ave Maria', instrument: 'Piano', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/1704734a65540b5c0e23a29abf0a03853a7660e0/score_0.png@260x364?no-cache=1715689767&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.mfiles.co.uk/scores/ave-maria.pdf' },
            { id: 8, name: 'Ode to Joy', instrument: 'Piano', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/3595f981966b4fce8d2b0be3e11c9e9f6af6392f/score_0.png@260x364?no-cache=1715688331&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.mfiles.co.uk/scores/ode-to-joy.pdf' },
            { id: 9, name: 'Toccata and Fugue in D Minor', instrument: 'Piano', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/0cd879280a5f23ef7804259a797795d87c647628/score_0.png@260x364?no-cache=1715693664&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.mfiles.co.uk/scores/toccata-and-fugue.pdf' },
            { id: 10, name: 'Symphony No. 5', instrument: 'Violin', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/9d328a20e2e8ca5b514f79a8e1490148ba437849/score_0.png@260x364?no-cache=1715687260&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.mfiles.co.uk/scores/symphony-no5.pdf' },
            { id: 11, name: 'The Four Seasons - Spring', instrument: 'Violin', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/d75dbf73ad19490a97fae52f6558ce527da95161/score_0.png@260x364?no-cache=1715697697&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.musicnotes.com/sheetmusic/mtd.asp?ppn=MN0204453' },
            { id: 12, name: 'Boléro', instrument: 'Violin', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/399e02a6b3f9df351b35f3762707ce585709cdef/score_0.png@260x364?no-cache=1715688235&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.sheetmusicplus.com/title/bolero-sheet-music/20037246' },
            { id: 13, name: 'Prelude in C Major', instrument: 'Piano', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/1e27e8e929ac6fb0b4560f3be96dc30062e249e7/score_0.png@260x364?no-cache=1715687234&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.sheetmusicplus.com/title/prelude-in-c-sheet-music/20073144' },
            { id: 14, name: 'Rhapsody in Blue', instrument: 'Piano', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/48457a4c0f5d2c5629a5d1c90430e5795ba3fbb6/score_0.png@260x364?no-cache=1715687416&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.sheetmusicplus.com/title/rhapsody-in-blue-sheet-music/3002606' },
            { id: 15, name: 'Swan Lake', instrument: 'Violin', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/49201ef34ec98ef2b656368fcaa1a79c2911bad1/score_0.png@260x364?no-cache=1715689525&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.musicnotes.com/sheetmusic/mtd.asp?ppn=MN0218470' },
            { id: 16, name: 'La Vie en Rose', instrument: 'Trumpet', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/8748cf4f847759dfe5941388ca1dd5f29f10cd90/score_0.png@260x364?no-cache=1715689551&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.sheetmusicplus.com/title/la-vie-en-rose-sheet-music/20496427' },
            { id: 17, name: 'Hallelujah', instrument: 'Saxaphone', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/40e111b7fb78a724ebfa8a9515750e8158172048/score_0.png@260x364?no-cache=1715692696&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.musicnotes.com/sheetmusic/mtd.asp?ppn=MN0077014' },
            { id: 18, name: 'Don’t Stop Believin’', instrument: 'Trumbone', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/8dd63c52ca5cc2ace4b966418541f1034b71bfd5/score_0.png@260x364?no-cache=1715690594&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.musicnotes.com/sheetmusic/mtd.asp?ppn=MN0209343' },
            { id: 19, name: 'All of Me', instrument: 'Violin', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/9435d39b70dbadcaec13a23dcb4567eea040a85c/score_0.png@260x364?no-cache=1715689527&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.musicnotes.com/sheetmusic/mtd.asp?ppn=MN0134138' },
            { id: 20, name: 'Somewhere Over the Rainbow', instrument: 'Flute', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/d926a9b243bc22977e5e6fb8272cadba1be6c8c2/score_0.png@260x364?no-cache=1715688628&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://www.sheetmusicplus.com/title/somewhere-over-the-rainbow-sheet-music/20056746' },
            { id: 21, name: 'Never Gonna Give You Up', instrument: 'Saxaphone', thumbnail: 'https://musescore.com/static/musescore/scoredata/g/70cd32720ea644035eb8d188df568d7d57838a5c/score_0.png@260x364?no-cache=1715690691&bgclr=ffffff&fmt=webp&qlt=80', pdfUrl: 'https://musescore.com/user/26643386/scores/4879546' }

        ]);
    }, []);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
      };
    
      const handleInstrumentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedInstrument(event.target.value);
      };
    
      const filteredMusicSheets = musicSheets.filter(sheet => {
        const matchesSearchQuery = sheet.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesInstrument = selectedInstrument === 'All' || sheet.instrument === selectedInstrument;
        return matchesSearchQuery && matchesInstrument;
      });

    const openPdf = (pdfUrl: string) => {
        setSelectedPdf(pdfUrl);
    };

    const closePdf = () => {
        setSelectedPdf(null);
    };

    return (
        <div className="homepage">
          <NavBar />
          <h1 className="sheet-text">Practice With Our Music Sheets!</h1>
          <div className="filter-container">
            <input
              type="text"
              placeholder="Search by song title"
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-bar"
            />
            <select value={selectedInstrument} onChange={handleInstrumentChange} className="instrument-filter">
              <option value="All">All Instruments</option>
              <option value="Piano">Piano</option>
              <option value="Violin">Violin</option>
              <option value="Trumpet">Trumpet</option>
              <option value="Saxaphone">Saxaphone</option>
              <option value="Trumbone">Trumbone</option>
            </select>
          </div>
          <div className="music-sheets">
            {filteredMusicSheets.map(sheet => (
              <div key={sheet.id} className="sheet-card" onClick={() => openPdf(sheet.pdfUrl)}>
                <div className="sheet-thumbnail">
                  <img src={sheet.thumbnail} alt={`${sheet.name} thumbnail`} />
                </div>
                <div className="sheet-info">
                  <p>{sheet.name}</p>
                  <p>{sheet.instrument}</p>
                </div>
              </div>
            ))}
          </div>
          {selectedPdf && (
            <div className="pdf-modal" onClick={closePdf}>
              <div className="pdf-content" onClick={e => e.stopPropagation()}>
                <button className="pdf-close" onClick={closePdf}>X</button>
                <iframe src={selectedPdf} frameBorder="0" />
              </div>
            </div>
          )}
        </div>
      );
    };

export default SheetMusic;
