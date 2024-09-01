export interface Student {
  MicrosoftID: string,
  DiscordID: string,
  Name: string,
  Class: string,
}

export function getClassName(input: string): string {
  const years = input.split("-");
  const start_date = new Date(Date.UTC(Number(years[1]), 6));
  const diff = Math.floor((Date.now() - start_date.valueOf()) / 86400000);
  const specialization = input.at(input.length-1) === ")" ? "" : input.at(input.length - 1);
  const year = Math.floor(diff / 365) + 1;
  if (year > 4) return "Absolvent";
  return `${input.at(0)}${year}${specialization}`
}
