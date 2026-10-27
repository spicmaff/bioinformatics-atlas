/** Synthetic inputs for an explanation, not sequences from a biological specimen. */
export const alignmentExamples=[
 {id:'equal',label:'Совпадения',a:'ACGTACGT',b:'ACGTACGT',description:'Каждая колонка содержит одинаковые буквы: 8 × 2 = 16.'},
 {id:'substitution',label:'Замена',a:'ACGTACGT',b:'ACGTTCGT',description:'В пятой колонке A сопоставлена с T: семь совпадений и одна замена дают 13.'},
 {id:'gap',label:'Пропуск',a:'ACGTACGT',b:'ACGTCGT',description:'Вторая строка короче. Оптимальное выравнивание содержит пропуск: 7 × 2 − 2 = 12.'},
] as const;
