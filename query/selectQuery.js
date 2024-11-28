"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.selectQuery=selectQuery;const utils_1=require("./utils");let aggregates_alias={MIN:"minimum",MAX:"maximum",SUM:"summation",COUNT:"count",AVG:"average"};function selectQuery(e){const{distinct:s,sort:t,limitSkip:i,columns:r,subQueries:a,groupBy:u,recursiveCTE:n,aggregates:l,table:$,where:o,having:m,joins:c}=e;let p=$,g="";if(n){const{baseCase:e,recursiveCase:s,alias:t}=n;g=`WITH RECURSIVE ${t} AS (\n            ${e}\n            UNION ALL\n            ${s}\n        ) `,p=t}let S=`${g}SELECT `;
//! DISTINCT
s&&(S+="DISTINCT ");let I="";
//! SELECT Columns
//! FROM Clause
return r&&(I=(0,utils_1.parseColumns)(r)),a&&(I+=`${I?", ":""} ${a.map((e=>`(${e.query})${e.as?` AS ${e.as}`:""}`)).join(", ")}`),l&&(I+=`${I?", ":""}${l.map((e=>{const{alias:s,...t}=e;return s?`${Object.entries(t).map((([e,s])=>`${e}(${s})`)).join(", ")} AS ${s}`:Object.entries(t).map((([e,s])=>`${e}(${s}) AS ${aggregates_alias[e]||e}`)).join(", ")})).join(", ")}`),S+=`${I||"*"} FROM ${p}`,
//! Joins
c&&(S+=(0,utils_1.parseJoins)(c)),
//! WHERE Clause
o&&(S+=` WHERE ${o}`),
//! GROUP BY Clause
u&&(S+=(0,utils_1.parseGroupBy)(u)||""),
//! HAVING Clause
m&&(S+=` HAVING ${m}`),
//! ORDER BY Clause
t&&(S+=(0,utils_1.parseSort)(t)),
//! LIMIT and OFFSET
i&&(i.limit&&(S+=` LIMIT ${i.limit}`),i.skip&&(S+=` OFFSET ${i.skip}`)),S.trim()}