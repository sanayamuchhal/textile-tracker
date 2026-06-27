import { useEffect, useState } from "react";
import { db } from "../../data/db";

export function useReportData(tables) {
  const [data, setData] = useState({});
  const tablesKey = tables.join("|");

  useEffect(() => {
    let isMounted = true;
    const tableList = tablesKey.split("|").filter(Boolean);

    Promise.all(tableList.map((table) => db[table].toArray())).then((results) => {
      if (!isMounted) return;

      setData(
        tableList.reduce((nextData, table, index) => {
          nextData[table] = results[index];
          return nextData;
        }, {})
      );
    });

    return () => {
      isMounted = false;
    };
  }, [tablesKey]);

  return data;
}
