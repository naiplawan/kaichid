import { useState } from 'react';
import demoLocale from '../locales/demo.json';

interface DemoLocale {
  en: {
    welcome: string;
    intro: string;
    howToPlay: string;
    howToPlaySteps: string[];
    howToPlayNote: string;
  };
  th: {
    welcome: string;
    intro: string;
    howToPlay: string;
    howToPlaySteps: string[];
    howToPlayNote: string;
  };
}

export default function Demo() {
  const [language, setLanguage] = useState<'en' | 'th'>('en');
  const locale = (demoLocale as DemoLocale)[language];

  return (
    <div>
      <button onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}>
        {language === 'en' ? 'ภาษาไทย' : 'ENGLISH'}
      </button>
      <h1>{locale.welcome}</h1>
      <p>{locale.intro}</p>
      <h2>{locale.howToPlay}</h2>
      <ol>
        {locale.howToPlaySteps.map((step: string, i: number) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: step }} />
        ))}
      </ol>
      <div>{locale.howToPlayNote}</div>
    </div>
  );
}
