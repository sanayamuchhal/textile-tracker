export function getMonth(dateString) {
  const date = new Date(dateString);

  return (
    date.toLocaleString("en-US", { month: "short" }) +
    "-" +
    String(date.getFullYear()).slice(2)
  );
}

export function getWeek(dateString) {
  const date = new Date(dateString);

  const month = date.toLocaleString("en-US", {
    month: "long",
  });

  const week = Math.ceil(date.getDate() / 7);

  return `${month}${week}Week${String(date.getFullYear()).slice(2)}`;
}