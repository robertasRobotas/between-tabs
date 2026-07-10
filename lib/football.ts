// Country data for the Panini-style player card generator.
// c1 / c2 are the two colours used for the big "26" backdrop.
// flag is the emoji (rendered inside the circular badge).

export type Country = {
  name: string;
  code: string; // 3-letter code shown vertically
  flag: string;
  c1: string;
  c2: string;
};

export const COUNTRIES: Country[] = [
  { name: "Argentina", code: "ARG", flag: "🇦🇷", c1: "#8FB8DE", c2: "#8FB8DE" },
  { name: "Australia", code: "AUS", flag: "🇦🇺", c1: "#00843D", c2: "#FFCD00" },
  { name: "Austria", code: "AUT", flag: "🇦🇹", c1: "#ED2939", c2: "#ffffff" },
  { name: "Belgium", code: "BEL", flag: "🇧🇪", c1: "#000000", c2: "#FDDA24" },
  { name: "Brazil", code: "BRA", flag: "🇧🇷", c1: "#009C3B", c2: "#FFDF00" },
  { name: "Cameroon", code: "CMR", flag: "🇨🇲", c1: "#007A5E", c2: "#CE1126" },
  { name: "Canada", code: "CAN", flag: "🇨🇦", c1: "#D80621", c2: "#ffffff" },
  { name: "Chile", code: "CHI", flag: "🇨🇱", c1: "#0039A6", c2: "#D52B1E" },
  { name: "Colombia", code: "COL", flag: "🇨🇴", c1: "#FCD116", c2: "#003893" },
  { name: "Croatia", code: "CRO", flag: "🇭🇷", c1: "#FF0000", c2: "#171796" },
  { name: "Denmark", code: "DEN", flag: "🇩🇰", c1: "#C8102E", c2: "#ffffff" },
  { name: "Ecuador", code: "ECU", flag: "🇪🇨", c1: "#FFD100", c2: "#0072CE" },
  { name: "Egypt", code: "EGY", flag: "🇪🇬", c1: "#CE1126", c2: "#000000" },
  { name: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", c1: "#CE1124", c2: "#0A2472" },
  { name: "France", code: "FRA", flag: "🇫🇷", c1: "#0055A4", c2: "#EF4135" },
  { name: "Germany", code: "GER", flag: "🇩🇪", c1: "#000000", c2: "#DD0000" },
  { name: "Ghana", code: "GHA", flag: "🇬🇭", c1: "#CE1126", c2: "#006B3F" },
  { name: "Iran", code: "IRN", flag: "🇮🇷", c1: "#239F40", c2: "#DA0000" },
  { name: "Italy", code: "ITA", flag: "🇮🇹", c1: "#008C45", c2: "#CD212A" },
  { name: "Ivory Coast", code: "CIV", flag: "🇨🇮", c1: "#FF8200", c2: "#009A44" },
  { name: "Japan", code: "JPN", flag: "🇯🇵", c1: "#BC002D", c2: "#ffffff" },
  { name: "Mexico", code: "MEX", flag: "🇲🇽", c1: "#006847", c2: "#CE1126" },
  { name: "Morocco", code: "MAR", flag: "🇲🇦", c1: "#C1272D", c2: "#006233" },
  { name: "Netherlands", code: "NED", flag: "🇳🇱", c1: "#AE1C28", c2: "#21468B" },
  { name: "Nigeria", code: "NGA", flag: "🇳🇬", c1: "#008751", c2: "#ffffff" },
  { name: "Norway", code: "NOR", flag: "🇳🇴", c1: "#EF2B2D", c2: "#002868" },
  { name: "Peru", code: "PER", flag: "🇵🇪", c1: "#D91023", c2: "#ffffff" },
  { name: "Poland", code: "POL", flag: "🇵🇱", c1: "#ffffff", c2: "#DC143C" },
  { name: "Portugal", code: "POR", flag: "🇵🇹", c1: "#006600", c2: "#FF0000" },
  { name: "Qatar", code: "QAT", flag: "🇶🇦", c1: "#8A1538", c2: "#ffffff" },
  { name: "Saudi Arabia", code: "KSA", flag: "🇸🇦", c1: "#006C35", c2: "#ffffff" },
  { name: "Scotland", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", c1: "#0065BF", c2: "#ffffff" },
  { name: "Senegal", code: "SEN", flag: "🇸🇳", c1: "#00853F", c2: "#FDEF42" },
  { name: "Serbia", code: "SRB", flag: "🇷🇸", c1: "#C6363C", c2: "#0C4076" },
  { name: "South Korea", code: "KOR", flag: "🇰🇷", c1: "#CD2E3A", c2: "#0047A0" },
  { name: "Spain", code: "ESP", flag: "🇪🇸", c1: "#C60B1E", c2: "#FFC400" },
  { name: "Sweden", code: "SWE", flag: "🇸🇪", c1: "#006AA7", c2: "#FECC00" },
  { name: "Switzerland", code: "SUI", flag: "🇨🇭", c1: "#D52B1E", c2: "#ffffff" },
  { name: "Turkey", code: "TUR", flag: "🇹🇷", c1: "#E30A17", c2: "#ffffff" },
  { name: "United States", code: "USA", flag: "🇺🇸", c1: "#B31942", c2: "#0A3161" },
  { name: "Uruguay", code: "URU", flag: "🇺🇾", c1: "#0038A8", c2: "#FCD116" },
  { name: "Wales", code: "WAL", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", c1: "#C8102E", c2: "#00AB39" },
];

export const DEFAULT_COUNTRY = "Croatia";

export function countryByName(name: string): Country {
  return (
    COUNTRIES.find((c) => c.name === name) ?? {
      name,
      code: name.slice(0, 3).toUpperCase(),
      flag: "🏳️",
      c1: "#334155",
      c2: "#64748b",
    }
  );
}
