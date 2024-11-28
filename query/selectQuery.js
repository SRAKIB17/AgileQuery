"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.selectQuery=selectQuery;const utils_1=require("./utils");let aggregates_alias={MIN:"minimum",MAX:"maximum",SUM:"summation",COUNT:"count",AVG:"average"};function selectQuery(e){const{distinct:s,sort:i,limitSkip:t,columns:r,subQueries:a,groupBy:u,recursiveCTE:n,aggregates:l,table:$,where:o,having:m,joins:c}=e;let p=$,g="";if(n){const{baseCase:e,recursiveCase:s,alias:i}=n;g=`WITH RECURSIVE ${i} AS (\n            ${e}\n            UNION ALL\n            ${s}\n        ) `,p=i}let S=`${g}SELECT `;
//! DISTINCT
s&&(S+="DISTINCT ");let I="";
//! SELECT Columns
if(r&&(I=(0,utils_1.parseColumns)(r)),a){I+=`${I?", ":""} ${a.map((e=>`(${e.query})${e.as?` AS ${e.as}`:""}`)).join(", ")}`}if(l){I+=`${I?", ":""}${l.map((e=>{const{alias:s,...i}=e;if(s){return`${Object.entries(i).map((([e,s])=>`${e}(${s})`)).join(", ")} AS ${s}`}return Object.entries(i).map((([e,s])=>`${e}(${s}) AS ${aggregates_alias[e]||e}`)).join(", ")})).join(", ")}`}
//! FROM Clause
return S+=`${I||"*"} FROM ${p}`,
//! Joins
c&&(S+=(0,utils_1.parseJoins)(c)),
//! WHERE Clause
o&&(S+=` WHERE ${o}`),
//! GROUP BY Clause
u&&(S+=(0,utils_1.parseGroupBy)(u)||""),
//! HAVING Clause
m&&(S+=` HAVING ${m}`),
//! ORDER BY Clause
i&&(S+=(0,utils_1.parseSort)(i)),
//! LIMIT and OFFSET
t&&(t.limit&&(S+=` LIMIT ${t.limit}`),t.skip&&(S+=` OFFSET ${t.skip}`)),S.trim()}