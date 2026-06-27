import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../data/db";
import "./FabGrinPivotReport.css";
import { exportPivotReport } from "../utils/exportPivotReport";

function FabGrinPivotReport() {

const [entries,setEntries]=useState([]);

const [parties,setParties]=useState([]);
const [categories,setCategories]=useState([]);
const [qualities,setQualities]=useState([]);
const [months,setMonths]=useState([]);
const [grins,setGrins]=useState([]);
const [invoices,setInvoices]=useState([]);

const [filters,setFilters]=useState({
from:"",
to:"",
party:"",
category:"",
quality:"",
month:"",
invoice:"",
grin:""
});

const [groupBy,setGroupBy]=useState([]);

const [values,setValues]=useState({
rollCount:true,
meter:true,
value:true,
averageRate:false,
returnMeter:false,
pcsCut:false
});

const [columns,setColumns]=useState({
date:true,
grin:true,
rollNo:true,
party:true,
invoice:true,
category:true,
quality:true,
meter:true,
rate:true,
value:true,
returnMeter:true,
pcsCut:true
});

useEffect(()=>{
loadData();
},[]);

async function loadData(){

const data=await db.fabEntries.toArray();

setEntries(data);

setParties(
  [
    ...new Set(
      data
        .map(x => x.party?.trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b))
);

setCategories(
  [
    ...new Set(
      data
        .map(x => x.category?.trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b))
);

setQualities(
  [
    ...new Set(
      data
        .map(x => x.quality?.trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b))
);

setMonths(
[...new Set(data.map(x=>x.month).filter(Boolean))].sort()
);

setGrins(
[...new Set(data.map(x=>x.grinNo).filter(Boolean))].sort((a,b)=>a-b)
);

setInvoices(
  [
    ...new Set(
      data
        .map(x => x.invoice?.trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b))
);
}

function handleFilter(e){

setFilters({
...filters,
[e.target.name]:e.target.value
});

}

function handleGroup(field){

if(groupBy.includes(field)){

setGroupBy(groupBy.filter(x=>x!==field));

}else{

setGroupBy([...groupBy,field]);

}

}

function handleValue(e){

setValues({
...values,
[e.target.name]:e.target.checked
});

}

function handleColumn(e){

setColumns({
...columns,
[e.target.name]:e.target.checked
});

}
function handleExport() {

  const exportData = entries.map((item) => {

    const row = {};

    if (columns.date) row["Date"] = item.date;
    if (columns.grin) row["GRIN"] = item.grinNo;
    if (columns.rollNo) row["Roll No"] = item.rollNo;
    if (columns.party) row["Party"] = item.party;
    if (columns.invoice) row["Invoice"] = item.invoice;
    if (columns.category) row["Category"] = item.category;
    if (columns.quality) row["Quality"] = item.quality;
    if (columns.meter) row["Meter"] = item.meter;
    if (columns.rate) row["Rate"] = item.rate;
    if (columns.value) row["Value"] = item.value;
    if (columns.returnMeter) row["Return Meter"] = item.returnMeter;
    if (columns.pcsCut) row["PCS Cut"] = item.pcsCut;

    return row;
  });

  exportPivotReport(exportData, "FAB_GRIN_Report");
}

return (
  <div className="report-container">

    <h1 className="report-title">
      FAB GRIN Report Builder
    </h1>

    {/* DATE FILTER */}

    <div className="report-card">

      <h3 className="section-title">
        Date Range
      </h3>

      <div className="filter-grid">

        <div className="filter-item">
          <label>From</label>
          <input
            type="date"
            name="from"
            value={filters.from}
            onChange={handleFilter}
          />
        </div>

        <div className="filter-item">
          <label>To</label>
          <input
            type="date"
            name="to"
            value={filters.to}
            onChange={handleFilter}
          />
        </div>

      </div>

    </div>

    {/* FILTERS */}

    <div className="report-card">

      <h3 className="section-title">
        Filters
      </h3>

      <div className="filter-grid">

        <div className="filter-item">
          <label>Party</label>

          <select
            name="party"
            value={filters.party}
            onChange={handleFilter}
          >
            <option value="">All Parties</option>

            {parties.map((party) => (
              <option key={party} value={party}>
                {party}
              </option>
            ))}
          </select>

        </div>

        <div className="filter-item">

          <label>Category</label>

          <select
            name="category"
            value={filters.category}
            onChange={handleFilter}
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}

          </select>

        </div>

        <div className="filter-item">

          <label>Quality</label>

          <select
            name="quality"
            value={filters.quality}
            onChange={handleFilter}
          >
            <option value="">All Qualities</option>

            {qualities.map((quality) => (
              <option key={quality} value={quality}>
                {quality}
              </option>
            ))}

          </select>

        </div>

        <div className="filter-item">

          <label>Invoice</label>

          <select
            name="invoice"
            value={filters.invoice}
            onChange={handleFilter}
          >
            <option value="">All Invoices</option>

            {invoices.map((invoice) => (
              <option key={invoice} value={invoice}>
                {invoice}
              </option>
            ))}

          </select>

        </div>

        <div className="filter-item">

          <label>Month</label>

          <select
            name="month"
            value={filters.month}
            onChange={handleFilter}
          >
            <option value="">All Months</option>

            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}

          </select>

        </div>

        <div className="filter-item">

          <label>GRIN</label>

          <select
            name="grin"
            value={filters.grin}
            onChange={handleFilter}
          >
            <option value="">All GRINs</option>

            {grins.map((grin) => (
              <option key={grin} value={grin}>
                {grin}
              </option>
            ))}

          </select>

        </div>

      </div>

    </div>

    {/* GROUP BY */}

    <div className="report-card">

      <h3 className="section-title">
        Group Rows By
      </h3>

      <div className="checkbox-grid">

        <label>
          <input
            type="checkbox"
            checked={groupBy.includes("party")}
            onChange={() => handleGroup("party")}
          />
          Party
        </label>

        <label>
          <input
            type="checkbox"
            checked={groupBy.includes("category")}
            onChange={() => handleGroup("category")}
          />
          Category
        </label>

        <label>
          <input
            type="checkbox"
            checked={groupBy.includes("quality")}
            onChange={() => handleGroup("quality")}
          />
          Quality
        </label>

        <label>
          <input
            type="checkbox"
            checked={groupBy.includes("month")}
            onChange={() => handleGroup("month")}
          />
          Month
        </label>

        <label>
          <input
            type="checkbox"
            checked={groupBy.includes("invoice")}
            onChange={() => handleGroup("invoice")}
          />
          Invoice
        </label>

        <label>
          <input
            type="checkbox"
            checked={groupBy.includes("grinNo")}
            onChange={() => handleGroup("grinNo")}
          />
          GRIN No
        </label>

      </div>

    </div>
        {/* REPORT VALUES */}

    <div className="report-card">

      <h3 className="section-title">
        Summary Values
      </h3>

      <div className="checkbox-grid">

        <label>
          <input
            type="checkbox"
            name="rollCount"
            checked={values.rollCount}
            onChange={handleValue}
          />
          Roll Count
        </label>

        <label>
          <input
            type="checkbox"
            name="meter"
            checked={values.meter}
            onChange={handleValue}
          />
          Total Meter
        </label>

        <label>
          <input
            type="checkbox"
            name="value"
            checked={values.value}
            onChange={handleValue}
          />
          Total Value
        </label>

        <label>
          <input
            type="checkbox"
            name="averageRate"
            checked={values.averageRate}
            onChange={handleValue}
          />
          Average Rate
        </label>

        <label>
          <input
            type="checkbox"
            name="returnMeter"
            checked={values.returnMeter}
            onChange={handleValue}
          />
          Return Meter
        </label>

        <label>
          <input
            type="checkbox"
            name="pcsCut"
            checked={values.pcsCut}
            onChange={handleValue}
          />
          PCS Cut
        </label>

      </div>

    </div>


    {/* DETAIL COLUMNS */}

    <div className="report-card">

      <h3 className="section-title">
        Detail Columns
      </h3>

      <div className="checkbox-grid">

        {Object.keys(columns).map((column)=>(
          <label key={column}>

            <input
              type="checkbox"
              name={column}
              checked={columns[column]}
              onChange={handleColumn}
            />

            {column}

          </label>
        ))}

      </div>

    </div>


    {/* REPORT PREVIEW */}

    <div className="report-card">

      <h3 className="section-title">
        Report Preview
      </h3>

      <div className="preview-box">

        <p>
          Total Records Loaded :
          <strong> {entries.length}</strong>
        </p>

        <hr />

        <p>
          Selected Filters
        </p>

        <ul>

          <li>
            Party :
            {filters.party || " All"}
          </li>

          <li>
            Category :
            {filters.category || " All"}
          </li>

          <li>
            Quality :
            {filters.quality || " All"}
          </li>

          <li>
            Invoice :
            {filters.invoice || " All"}
          </li>

          <li>
            Month :
            {filters.month || " All"}
          </li>

          <li>
            GRIN :
            {filters.grin || " All"}
          </li>

        </ul>

        <hr />

        <p>

          Group By :

          {groupBy.length===0
            ? " None"
            : " " + groupBy.join(" → ")}

        </p>

      </div>

    </div>


    {/* BUTTONS */}

    <div className="button-row">

      <button>
        Generate Report
      </button>

      <button onClick={handleExport}>
    Export Excel
</button>

      <button
        onClick={()=>{
          setFilters({
            from:"",
            to:"",
            party:"",
            category:"",
            quality:"",
            month:"",
            invoice:"",
            grin:""
          });

          setGroupBy([]);
        }}
      >
        Clear Filters
      </button>

    </div>


    <br/>

    <Link to="/reports">
      <button>
        ← Back to Reports
      </button>
    </Link>

  </div>
);

}

export default FabGrinPivotReport;