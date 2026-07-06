import { useCallback, useEffect, useState } from "react";
import { db } from "../../data/db";

export function useReportData(tables) {
  const [data, setData] = useState({});
  const tablesKey = tables.join("|");

  const loadData = useCallback(async () => {
    const tableList = tablesKey.split("|").filter(Boolean);

    const results = await Promise.all(
      tableList.map((table) => db[table].toArray())
    );

    setData(
      tableList.reduce((nextData, table, index) => {
        nextData[table] = results[index];
        return nextData;
      }, {})
    );
  }, [tablesKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...data,
    reload: loadData,
  };
}