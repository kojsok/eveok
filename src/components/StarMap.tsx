"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import systemsData from "../data/Systems.json";

const fetchSecurityStatus = async (systemId: number) => {
  try {
    const response = await fetch(
      `https://esi.evetech.net/latest/universe/systems/${systemId}/`
    );
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    return data.security_status;
  } catch (error) {
    console.error("Error fetching security status:", error);
    return null;
  }
};

const getColorBySecurity = (security: number | null) => {
  if (security === null) return "gray";
  if (security > 0.5) return "green";
  if (security > 0.0) return "yellow";
  return "red";
};

const StarMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [routeSystems, setRouteSystems] = useState<number[]>([]);
  const [securityData, setSecurityData] = useState<Record<number, number>>({});
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [routeType, setRouteType] = useState("shortest");

  // Динамический поиск
  const [filteredSystems, setFilteredSystems] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (value: string, setFunc: (value: string) => void) => {
    setFunc(value);
    if (value.length > 0) {
      const matches = systemsData
        .filter((sys) =>
          sys.itemName.toLowerCase().includes(value.toLowerCase())
        )
        .map((sys) => sys.itemName);
      setFilteredSystems(matches);
      setShowDropdown(true);
    } else {
      setFilteredSystems([]);
      setShowDropdown(false);
    }
  };

  const handleSelectSystem = (systemName: string, setFunc: (value: string) => void) => {
    setFunc(systemName);
    setFilteredSystems([]);
    setShowDropdown(false);
  };

  useEffect(() => {
    if (routeSystems.length === 0) return;

    const fetchRouteSecurityStatuses = async () => {
      const newSecurityData: Record<number, number> = {};
      for (const systemId of routeSystems) {
        const security = await fetchSecurityStatus(systemId);
        if (security !== null) newSecurityData[systemId] = security;
      }
      setSecurityData(newSecurityData);
    };
    fetchRouteSecurityStatuses();
  }, [routeSystems]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = window.innerWidth;
    const height = window.innerHeight;
    const minX = d3.min(systemsData, (d) => d.x) || 0;
    const maxX = d3.max(systemsData, (d) => d.x) || 1;
    const minY = d3.min(systemsData, (d) => d.y) || 0;
    const maxY = d3.max(systemsData, (d) => d.y) || 1;

    const scaleX = d3.scaleLinear().domain([minX, maxX]).range([50, width - 50]);
    const scaleY = d3.scaleLinear().domain([minY, maxY]).range([50, height - 50]);

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => g.attr("transform", event.transform));
      
    svg.call(zoom);

    if (routeSystems.length > 1) {
      const routeCoords = routeSystems
        .map((id) => {
          const system = systemsData.find((sys) => sys.itemID === id);
          return system ? { x: scaleX(system.x), y: scaleY(system.y) } : null;
        })
        .filter((coord) => coord !== null) as { x: number; y: number }[];

      g.selectAll("line")
        .data(routeCoords.slice(1))
        .enter()
        .append("line")
        .attr("x1", (d, i) => routeCoords[i].x)
        .attr("y1", (d, i) => routeCoords[i].y)
        .attr("x2", (d) => d.x)
        .attr("y2", (d) => d.y)
        .attr("stroke", "red")
        .attr("stroke-width", 2);
    }

    const systemNodes = g.selectAll("circle")
      .data(systemsData)
      .enter()
      .append("g");

    systemNodes.append("circle")
      .attr("cx", (d) => scaleX(d.x))
      .attr("cy", (d) => scaleY(d.y))
      .attr("r", (d) => (routeSystems.includes(d.itemID) ? 4 : 2))
      .attr("fill", (d) =>
        routeSystems.includes(d.itemID)
          ? getColorBySecurity(securityData[d.itemID])
          : "yellow"
      );

    systemNodes.append("text")
      .attr("x", (d) => scaleX(d.x) + 5)
      .attr("y", (d) => scaleY(d.y) - 5)
      .attr("fill", "white")
      .attr("font-size", "10px")
      .style("visibility", "hidden")
      .text((d) => d.itemName);

    systemNodes.on("mouseover", function () {
      d3.select(this).select("text").style("visibility", "visible");
    }).on("mouseout", function () {
      d3.select(this).select("text").style("visibility", "hidden");
    });
  }, [securityData, routeSystems]);

  const handleFindRoute = async () => {
    const originSystem = systemsData.find((sys) => sys.itemName === origin);
    const destinationSystem = systemsData.find((sys) => sys.itemName === destination);
    if (!originSystem || !destinationSystem) return;

    try {
      const response = await fetch(
        `https://esi.evetech.net/latest/route/${originSystem.itemID}/${destinationSystem.itemID}/?flag=${routeType}`
      );
      if (!response.ok) throw new Error("Failed to fetch route");
      const route = await response.json();
      setRouteSystems(route);
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} width="100vw" height="80vh" className="bg-black" />
      <div className="flex flex-row items-center w-full p-4 gap-2">
        {["origin", "destination"].map((type) => (
          <div key={type} className="relative w-full">
            <input
              type="text"
              value={type === "origin" ? origin : destination}
              onChange={(e) =>
                handleSearch(e.target.value, type === "origin" ? setOrigin : setDestination)
              }
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder={type === "origin" ? origin || "Начальная система" : destination || "Конечная система"}
              className="input-class"
            />
            {showDropdown && (
              <ul className="absolute bg-gray-800 w-full border border-gray-700 rounded-md max-h-40 overflow-y-auto">
                {filteredSystems.map((sys) => (
                  <li
                    key={sys}
                    onClick={() => handleSelectSystem(sys, type === "origin" ? setOrigin : setDestination)}
                    className="p-2 hover:bg-gray-600 cursor-pointer"
                  >
                    {sys}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        <select value={routeType} onChange={(e) => setRouteType(e.target.value)}>
  <option value="shortest">Кратчайший</option>
  <option value="secure">Безопасный</option>
  <option value="unsafe">Опасный</option>
</select>
        <button onClick={handleFindRoute} className="button-class">Найти маршрут</button>
      </div>
    </div>
  );
};

export default StarMap;




// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";
// import systemsData from "../data/Systems.json";

// const fetchSecurityStatus = async (systemId: number) => {
//   try {
//     const response = await fetch(`https://esi.evetech.net/latest/universe/systems/${systemId}/`);
//     if (!response.ok) throw new Error("Failed to fetch");
//     const data = await response.json();
//     return data.security_status;
//   } catch (error) {
//     console.error("Error fetching security status:", error);
//     return null;
//   }
// };

// const getColorBySecurity = (security: number) => {
//   if (security > 0.5) return "green";
//   if (security > 0.0) return "yellow";
//   return "red";
// };

// const StarMap = () => {
//   const svgRef = useRef(null);
//   const [routeSystems, setRouteSystems] = useState([]);
//   const [securityData, setSecurityData] = useState({});
//   const [origin, setOrigin] = useState("");
//   const [destination, setDestination] = useState("");
//   const [routeType, setRouteType] = useState("shortest");
//   // const [searchOriginInput, setSearchOriginInput] = useState("");
//   // const [searchDestinationInput, setSearchDestinationInput] = useState("");

//   useEffect(() => {
//     if (routeSystems.length === 0) return;
//     const fetchRouteSecurityStatuses = async () => {
//       const newSecurityData = {};
//       for (const systemId of routeSystems) {
//         newSecurityData[systemId] = await fetchSecurityStatus(systemId);
//       }
//       setSecurityData(newSecurityData);
//     };
//     fetchRouteSecurityStatuses();
//   }, [routeSystems]);

//   useEffect(() => {
//     if (!svgRef.current) return;

//     const svg = d3.select(svgRef.current);
//     svg.selectAll("*").remove();

//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     const minX = d3.min(systemsData, (d) => d.x) || 0;
//     const maxX = d3.max(systemsData, (d) => d.x) || 1;
//     const minY = d3.min(systemsData, (d) => d.y) || 0;
//     const maxY = d3.max(systemsData, (d) => d.y) || 1;

//     const scaleX = d3.scaleLinear().domain([minX, maxX]).range([50, width - 50]);
//     const scaleY = d3.scaleLinear().domain([minY, maxY]).range([50, height - 50]);

//     const zoom = d3.zoom()
//       .scaleExtent([0.5, 5])
//       .on("zoom", (event) => g.attr("transform", event.transform));

//     svg.call(zoom);
//     const g = svg.append("g");

//     if (routeSystems.length > 1) {
//       const routeCoords = routeSystems.map(id => {
//         const system = systemsData.find(sys => sys.itemID === id);
//         return system ? { x: scaleX(system.x), y: scaleY(system.y) } : null;
//       }).filter(coord => coord !== null);

//       g.selectAll("line")
//         .data(routeCoords.slice(1))
//         .enter()
//         .append("line")
//         .attr("x1", (d, i) => routeCoords[i].x)
//         .attr("y1", (d, i) => routeCoords[i].y)
//         .attr("x2", (d) => d.x)
//         .attr("y2", (d) => d.y)
//         .attr("stroke", "red")
//         .attr("stroke-width", 2);
//     }

//     const systemNodes = g.selectAll("circle")
//       .data(systemsData)
//       .enter()
//       .append("g");

//     systemNodes.append("circle")
//       .attr("cx", (d) => scaleX(d.x))
//       .attr("cy", (d) => scaleY(d.y))
//       .attr("r", (d) => routeSystems.includes(d.itemID) ? 4 : 2)
//       .attr("fill", (d) => routeSystems.includes(d.itemID) ? getColorBySecurity(securityData[d.itemID]) : "yellow");

//     systemNodes.append("text")
//       .attr("x", (d) => scaleX(d.x) + 5)
//       .attr("y", (d) => scaleY(d.y) - 5)
//       .attr("fill", "white")
//       .attr("font-size", "10px")
//       .style("visibility", "hidden")
//       .text((d) => d.itemName);

//     systemNodes.on("mouseover", function (event, d) {
//       d3.select(this).select("text").style("visibility", "visible");
//     }).on("mouseout", function (event, d) {
//       d3.select(this).select("text").style("visibility", "hidden");
//     });
//   }, [securityData, routeSystems]);

//   const handleFindRoute = async () => {
//     const originSystem = systemsData.find((sys) => sys.itemName === origin);
//     const destinationSystem = systemsData.find((sys) => sys.itemName === destination);
//     if (!originSystem || !destinationSystem) return;

//     try {
//       const response = await fetch(`https://esi.evetech.net/latest/route/${originSystem.itemID}/${destinationSystem.itemID}/?flag=${routeType}`);
//       if (!response.ok) throw new Error("Failed to fetch route");
//       const route = await response.json();
//       setRouteSystems(route);
//     } catch (error) {
//       console.error("Error fetching route:", error);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center">
//       <svg ref={svgRef} width="100vw" height="80vh" className="bg-black" />
//       <div className="flex flex-row items-center w-full p-4 gap-2">
//         <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Начальная система" className="input-class" />
//         <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Конечная система" className="input-class" />
//         <select value={routeType} onChange={(e) => setRouteType(e.target.value)} className="input-class">
//           <option value="shortest">Shortest</option>
//           <option value="secure">Secure</option>
//           <option value="insecure">Insecure</option>
//         </select>
//         <button onClick={handleFindRoute} className="button-class">Найти маршрут</button>
//       </div>
//     </div>
//   );
// };

// export default StarMap;




// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";
// import systemsData from "../data/Systems.json";

// const fetchSecurityStatus = async (systemId) => {
//   try {
//     const response = await fetch(`https://esi.evetech.net/latest/universe/systems/${systemId}/`);
//     if (!response.ok) throw new Error("Failed to fetch");
//     const data = await response.json();
//     return data.security_status;
//   } catch (error) {
//     console.error("Error fetching security status:", error);
//     return null;
//   }
// };

// const getColorBySecurity = (security) => {
//   if (security > 0.5) return "green";
//   if (security > 0.0) return "yellow";
//   return "red";
// };

// const StarMap = () => {
//   const svgRef = useRef(null);
//   const [routeSystems, setRouteSystems] = useState([]);
//   const [securityData, setSecurityData] = useState({});
//   const [origin, setOrigin] = useState("");
//   const [destination, setDestination] = useState("");
//   const [routeType, setRouteType] = useState("shortest");
//   const [filteredOriginSystems, setFilteredOriginSystems] = useState([]);
//   const [filteredDestinationSystems, setFilteredDestinationSystems] = useState([]);
//   const [searchOriginInput, setSearchOriginInput] = useState("");
//   const [searchDestinationInput, setSearchDestinationInput] = useState("");

//   useEffect(() => {
//     if (routeSystems.length === 0) return;

//     const fetchRouteSecurityStatuses = async () => {
//       const newSecurityData = {};
//       for (const systemId of routeSystems) {
//         newSecurityData[systemId] = await fetchSecurityStatus(systemId);
//       }
//       setSecurityData(newSecurityData);
//     };
//     fetchRouteSecurityStatuses();
//   }, [routeSystems]);

//   useEffect(() => {
//     if (!svgRef.current) return;

//     const svg = d3.select(svgRef.current);
//     svg.selectAll("*").remove();

//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     const minX = d3.min(systemsData, (d) => d.x) || 0;
//     const maxX = d3.max(systemsData, (d) => d.x) || 1;
//     const minY = d3.min(systemsData, (d) => d.y) || 0;
//     const maxY = d3.max(systemsData, (d) => d.y) || 1;

//     const scaleX = d3.scaleLinear().domain([minX, maxX]).range([50, width - 50]);
//     const scaleY = d3.scaleLinear().domain([minY, maxY]).range([50, height - 50]);

//     const zoom = d3.zoom()
//       .scaleExtent([0.5, 5])
//       .on("zoom", (event) => g.attr("transform", event.transform));

//     svg.call(zoom);
//     const g = svg.append("g");

//     // Отрисовка маршрута
//     if (routeSystems.length > 1) {
//       const routeCoords = routeSystems.map(id => {
//         const system = systemsData.find(sys => sys.itemID === id);
//         return system ? { x: scaleX(system.x), y: scaleY(system.y) } : null;
//       }).filter(coord => coord !== null);

//       g.selectAll("line")
//         .data(routeCoords.slice(1))
//         .enter()
//         .append("line")
//         .attr("x1", (d, i) => routeCoords[i].x)
//         .attr("y1", (d, i) => routeCoords[i].y)
//         .attr("x2", (d) => d.x)
//         .attr("y2", (d) => d.y)
//         .attr("stroke", "red")
//         .attr("stroke-width", 2);
//     }

//     g.selectAll("circle")
//       .data(systemsData)
//       .enter()
//       .append("circle")
//       .attr("cx", (d) => scaleX(d.x))
//       .attr("cy", (d) => scaleY(d.y))
//       .attr("r", (d) => routeSystems.includes(d.itemID) ? 4 : 2)
//       .attr("fill", (d) => routeSystems.includes(d.itemID) ? getColorBySecurity(securityData[d.itemID]) : "yellow");
//   }, [securityData, routeSystems]);

//   const handleFindRoute = async () => {
//     const originSystem = systemsData.find((sys) => sys.itemName === origin);
//     const destinationSystem = systemsData.find((sys) => sys.itemName === destination);
//     if (!originSystem || !destinationSystem) return;

//     try {
//       const response = await fetch(`https://esi.evetech.net/latest/route/${originSystem.itemID}/${destinationSystem.itemID}/?flag=${routeType}`);
//       if (!response.ok) throw new Error("Failed to fetch route");
//       const route = await response.json();
//       setRouteSystems(route);
//     } catch (error) {
//       console.error("Error fetching route:", error);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center">
//       <svg ref={svgRef} width="100vw" height="80vh" className="bg-black" />
//       <div className="flex flex-col items-center w-full p-4">
//         {/* Инпут для выбора начальной системы */}
//         <input 
//           type="text" 
//           value={searchOriginInput} 
//           onChange={(e) => {
//             setSearchOriginInput(e.target.value);
//             setFilteredOriginSystems(systemsData.filter(s => s.itemName.toLowerCase().includes(e.target.value.toLowerCase())));
//           }}
//           placeholder="Введите название начальной системы"
//           className="text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md py-2 px-3"
//         />
//         {filteredOriginSystems.length > 0 && (
//           <ul className="bg-slate-800 text-white border border-[rgba(105,113,162,0.4)] rounded-md w-full max-h-40 overflow-y-auto">
//             {filteredOriginSystems.map(s => (
//               <li key={s.itemID} className="cursor-pointer p-2 hover:bg-slate-700" onClick={() => {
//                 setOrigin(s.itemName);
//                 setSearchOriginInput("");
//                 setFilteredOriginSystems([]);
//               }}>{s.itemName}</li>
//             ))}
//           </ul>
//         )}

//         {/* Инпут для выбора конечной системы */}
//         <input 
//           type="text" 
//           value={searchDestinationInput} 
//           onChange={(e) => {
//             setSearchDestinationInput(e.target.value);
//             setFilteredDestinationSystems(systemsData.filter(s => s.itemName.toLowerCase().includes(e.target.value.toLowerCase())));
//           }}
//           placeholder="Введите название конечной системы"
//           className="text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md py-2 px-3 mt-2"
//         />
//         {filteredDestinationSystems.length > 0 && (
//           <ul className="bg-slate-800 text-white border border-[rgba(105,113,162,0.4)] rounded-md w-full max-h-40 overflow-y-auto">
//             {filteredDestinationSystems.map(s => (
//               <li key={s.itemID} className="cursor-pointer p-2 hover:bg-slate-700" onClick={() => {
//                 setDestination(s.itemName);
//                 setSearchDestinationInput("");
//                 setFilteredDestinationSystems([]);
//               }}>{s.itemName}</li>
//             ))}
//           </ul>
//         )}

//         <select value={routeType} onChange={(e) => setRouteType(e.target.value)} className="text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md py-2 px-3 mt-2">
//           <option value="shortest">Shortest</option>
//           <option value="secure">Secure</option>
//           <option value="insecure">Insecure</option>
//         </select>
//         <button onClick={handleFindRoute} className="inline-flex gap-2 px-3 py-2 text-sm font-medium text-white rounded-[10px] border bg-gradient-to-r from-[#161A31] to-[#06091F] hover:scale-105 hover:from-[#06091F] hover:to-[#161A31] shadow-md mt-2">Найти маршрут</button>
//       </div>
//     </div>
//   );
// };

// export default StarMap;







// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";
// import systemsData from "../data/Systems.json";

// const fetchSecurityStatus = async (systemId) => {
//   try {
//     const response = await fetch(`https://esi.evetech.net/latest/universe/systems/${systemId}/`);
//     if (!response.ok) throw new Error("Failed to fetch");
//     const data = await response.json();
//     return data.security_status;
//   } catch (error) {
//     console.error("Error fetching security status:", error);
//     return null;
//   }
// };

// const getColorBySecurity = (security) => {
//   if (security > 0.5) return "green";
//   if (security > 0.0) return "yellow";
//   return "red";
// };

// const StarMap = () => {
//   const svgRef = useRef(null);
//   const [routeSystems, setRouteSystems] = useState([]);
//   const [securityData, setSecurityData] = useState({});
//   const [origin, setOrigin] = useState("");
//   const [destination, setDestination] = useState("");
//   const [routeType, setRouteType] = useState("shortest");
  
//   useEffect(() => {
//     if (routeSystems.length === 0) return;

//     const fetchRouteSecurityStatuses = async () => {
//       const newSecurityData = {};
//       for (const systemId of routeSystems) {
//         newSecurityData[systemId] = await fetchSecurityStatus(systemId);
//       }
//       setSecurityData(newSecurityData);
//     };
//     fetchRouteSecurityStatuses();
//   }, [routeSystems]);

//   useEffect(() => {
//     if (!svgRef.current) return;

//     const svg = d3.select(svgRef.current);
//     svg.selectAll("*").remove();

//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     const minX = d3.min(systemsData, (d) => d.x) || 0;
//     const maxX = d3.max(systemsData, (d) => d.x) || 1;
//     const minY = d3.min(systemsData, (d) => d.y) || 0;
//     const maxY = d3.max(systemsData, (d) => d.y) || 1;

//     const scaleX = d3.scaleLinear().domain([minX, maxX]).range([50, width - 50]);
//     const scaleY = d3.scaleLinear().domain([minY, maxY]).range([50, height - 50]);

//     const zoom = d3.zoom()
//       .scaleExtent([0.5, 5])
//       .on("zoom", (event) => g.attr("transform", event.transform));

//     svg.call(zoom);
//     const g = svg.append("g");

//     const tooltip = d3.select("body").append("div")
//       .style("position", "absolute")
//       .style("background", "white")
//       .style("padding", "5px")
//       .style("border-radius", "5px")
//       .style("display", "none");

//     // Отрисовка маршрута
//     if (routeSystems.length > 1) {
//       const routeCoords = routeSystems.map(id => {
//         const system = systemsData.find(sys => sys.itemID === id);
//         return system ? { x: scaleX(system.x), y: scaleY(system.y) } : null;
//       }).filter(coord => coord !== null);

//       g.selectAll("line")
//         .data(routeCoords.slice(1))
//         .enter()
//         .append("line")
//         .attr("x1", (d, i) => routeCoords[i].x)
//         .attr("y1", (d, i) => routeCoords[i].y)
//         .attr("x2", (d) => d.x)
//         .attr("y2", (d) => d.y)
//         .attr("stroke", "white")
//         .attr("stroke-width", 1);
//     }

//     g.selectAll("circle")
//       .data(systemsData)
//       .enter()
//       .append("circle")
//       .attr("cx", (d) => scaleX(d.x))
//       .attr("cy", (d) => scaleY(d.y))
//       .attr("r", 2)
//       .attr("fill", (d) => routeSystems.includes(d.itemID) ? getColorBySecurity(securityData[d.itemID]) : "yellow")
//       .on("mouseover", (event, d) => {
//         tooltip.style("display", "block").text(d.itemName);
//       })
//       .on("mousemove", (event) => {
//         tooltip.style("left", `${event.pageX + 10}px`)
//                .style("top", `${event.pageY + 10}px`);
//       })
//       .on("mouseout", () => {
//         tooltip.style("display", "none");
//       });
//   }, [securityData, routeSystems]);

//   const handleFindRoute = async () => {
//     const originSystem = systemsData.find((sys) => sys.itemName === origin);
//     const destinationSystem = systemsData.find((sys) => sys.itemName === destination);
//     if (!originSystem || !destinationSystem) return;

//     try {
//       const response = await fetch(`https://esi.evetech.net/latest/route/${originSystem.itemID}/${destinationSystem.itemID}/?flag=${routeType}`);
//       if (!response.ok) throw new Error("Failed to fetch route");
//       const route = await response.json();
//       setRouteSystems(route);
//     } catch (error) {
//       console.error("Error fetching route:", error);
//     }
//   };

//   return (
//     <div>
//       <svg ref={svgRef} width="100vw" height="90vh" style={{ display: "block", background: "black" }} />
//       <div style={{ textAlign: "center", marginTop: "10px", background: "white", padding: "10px", borderRadius: "5px" }}>
//         <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Откуда" />
//         <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Куда" />
//         <select value={routeType} onChange={(e) => setRouteType(e.target.value)}>
//           <option value="shortest">Shortest</option>
//           <option value="secure">Secure</option>
//           <option value="insecure">Insecure</option>
//         </select>
//         <button onClick={handleFindRoute}>Найти маршрут</button>
//       </div>
//     </div>
//   );
// };

// export default StarMap;




//!!показывают карту и маршрут но не прокладывает
// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";
// import systemsData from "../data/Systems.json";

// const fetchSecurityStatus = async (systemId) => {
//   try {
//     const response = await fetch(`https://esi.evetech.net/latest/universe/systems/${systemId}/`);
//     if (!response.ok) throw new Error("Failed to fetch");
//     const data = await response.json();
//     return data.security_status;
//   } catch (error) {
//     console.error("Error fetching security status:", error);
//     return null;
//   }
// };

// const getColorBySecurity = (security) => {
//   if (security > 0.5) return "green";
//   if (security > 0.0) return "yellow";
//   return "red";
// };

// const StarMap = () => {
//   const svgRef = useRef(null);
//   const [routeSystems, setRouteSystems] = useState([]);
//   const [securityData, setSecurityData] = useState({});
//   const [origin, setOrigin] = useState("");
//   const [destination, setDestination] = useState("");
//   const [routeType, setRouteType] = useState("shortest");
  
//   useEffect(() => {
//     if (routeSystems.length === 0) return;

//     const fetchRouteSecurityStatuses = async () => {
//       const newSecurityData = {};
//       for (const systemId of routeSystems) {
//         newSecurityData[systemId] = await fetchSecurityStatus(systemId);
//       }
//       setSecurityData(newSecurityData);
//     };
//     fetchRouteSecurityStatuses();
//   }, [routeSystems]);

//   useEffect(() => {
//     if (!svgRef.current) return;

//     const svg = d3.select(svgRef.current);
//     svg.selectAll("*").remove();

//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     const minX = d3.min(systemsData, (d) => d.x) || 0;
//     const maxX = d3.max(systemsData, (d) => d.x) || 1;
//     const minY = d3.min(systemsData, (d) => d.y) || 0;
//     const maxY = d3.max(systemsData, (d) => d.y) || 1;

//     const scaleX = d3.scaleLinear().domain([minX, maxX]).range([50, width - 50]);
//     const scaleY = d3.scaleLinear().domain([minY, maxY]).range([50, height - 50]);

//     const zoom = d3.zoom()
//       .scaleExtent([0.5, 5])
//       .on("zoom", (event) => g.attr("transform", event.transform));

//     svg.call(zoom);
//     const g = svg.append("g");

//     const tooltip = d3.select("body").append("div")
//       .style("position", "absolute")
//       .style("background", "white")
//       .style("padding", "5px")
//       .style("border-radius", "5px")
//       .style("display", "none");

//     g.selectAll("circle")
//       .data(systemsData)
//       .enter()
//       .append("circle")
//       .attr("cx", (d) => scaleX(d.x))
//       .attr("cy", (d) => scaleY(d.y))
//       .attr("r", 2)
//       .attr("fill", (d) => routeSystems.includes(d.itemID) ? getColorBySecurity(securityData[d.itemID]) : "yellow")
//       .on("mouseover", (event, d) => {
//         tooltip.style("display", "block").text(d.itemName);
//       })
//       .on("mousemove", (event) => {
//         tooltip.style("left", `${event.pageX + 10}px`)
//                .style("top", `${event.pageY + 10}px`);
//       })
//       .on("mouseout", () => {
//         tooltip.style("display", "none");
//       });
//   }, [securityData, routeSystems]);

//   const handleFindRoute = async () => {
//     const originSystem = systemsData.find((sys) => sys.itemName === origin);
//     const destinationSystem = systemsData.find((sys) => sys.itemName === destination);
//     if (!originSystem || !destinationSystem) return;

//     try {
//       const response = await fetch(`https://esi.evetech.net/latest/route/${originSystem.itemID}/${destinationSystem.itemID}/?flag=${routeType}`);
//       if (!response.ok) throw new Error("Failed to fetch route");
//       const route = await response.json();
//       setRouteSystems(route);
//     } catch (error) {
//       console.error("Error fetching route:", error);
//     }
//   };

//   return (
//     <div>
//       <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10, background: "white", padding: "10px", borderRadius: "5px" }}>
//         <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Откуда" />
//         <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Куда" />
//         <select value={routeType} onChange={(e) => setRouteType(e.target.value)}>
//           <option value="shortest">Shortest</option>
//           <option value="secure">Secure</option>
//           <option value="insecure">Insecure</option>
//         </select>
//         <button onClick={handleFindRoute}>Найти маршрут</button>
//       </div>
//       <svg ref={svgRef} width="100vw" height="100vh" style={{ display: "block", background: "black" }} />
//     </div>
//   );
// };

// export default StarMap;






//!! показывает карту и метки систем не трогать
// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";
// import systemsData from "../data/Systems.json";

// const fetchSecurityStatus = async (systemId) => {
//   try {
//     const response = await fetch(`https://esi.evetech.net/latest/universe/systems/${systemId}/`);
//     if (!response.ok) throw new Error("Failed to fetch");
//     const data = await response.json();
//     return data.security_status;
//   } catch (error) {
//     console.error("Error fetching security status:", error);
//     return null;
//   }
// };

// const getColorBySecurity = (security) => {
//   if (security > 0.5) return "green";
//   if (security > 0.0) return "yellow";
//   return "red";
// };

// const StarMap = () => {
//   const svgRef = useRef(null);
//   const [routeSystems, setRouteSystems] = useState([]);
//   const [securityData, setSecurityData] = useState({});

//   useEffect(() => {
//     if (routeSystems.length === 0) return;

//     const fetchRouteSecurityStatuses = async () => {
//       const newSecurityData = {};
//       for (const systemId of routeSystems) {
//         newSecurityData[systemId] = await fetchSecurityStatus(systemId);
//       }
//       setSecurityData(newSecurityData);
//     };
//     fetchRouteSecurityStatuses();
//   }, [routeSystems]);

//   useEffect(() => {
//     if (!svgRef.current) return;

//     const svg = d3.select(svgRef.current);
//     svg.selectAll("*").remove();

//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     const minX = d3.min(systemsData, (d) => d.x) || 0;
//     const maxX = d3.max(systemsData, (d) => d.x) || 1;
//     const minY = d3.min(systemsData, (d) => d.y) || 0;
//     const maxY = d3.max(systemsData, (d) => d.y) || 1;

//     const scaleX = d3.scaleLinear().domain([minX, maxX]).range([50, width - 50]);
//     const scaleY = d3.scaleLinear().domain([minY, maxY]).range([50, height - 50]);

//     const zoom = d3.zoom()
//       .scaleExtent([0.5, 5])
//       .on("zoom", (event) => g.attr("transform", event.transform));

//     svg.call(zoom);
//     const g = svg.append("g");

//     const tooltip = d3.select("body").append("div")
//       .style("position", "absolute")
//       .style("background", "white")
//       .style("padding", "5px")
//       .style("border-radius", "5px")
//       .style("display", "none");

//     g.selectAll("circle")
//       .data(systemsData)
//       .enter()
//       .append("circle")
//       .attr("cx", (d) => scaleX(d.x))
//       .attr("cy", (d) => scaleY(d.y))
//       .attr("r", 2)
//       .attr("fill", (d) => routeSystems.includes(d.itemID) ? getColorBySecurity(securityData[d.itemID]) : "yellow")
//       .on("mouseover", (event, d) => {
//         tooltip.style("display", "block").text(d.itemName);
//       })
//       .on("mousemove", (event) => {
//         tooltip.style("left", `${event.pageX + 10}px`)
//                .style("top", `${event.pageY + 10}px`);
//       })
//       .on("mouseout", () => {
//         tooltip.style("display", "none");
//       });
//   }, [securityData, routeSystems]);

//   return <svg ref={svgRef} width="100vw" height="100vh" style={{ display: "block", background: "black" }} />;
// };

// export default StarMap;






// "use client";
// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";
// import systemsData from "../data/Systems.json";

// const StarMap: React.FC = () => {
//   const svgRef = useRef<SVGSVGElement | null>(null);

//   useEffect(() => {
//     if (!svgRef.current) return;

//     const svg = d3.select(svgRef.current);
//     svg.selectAll("*").remove(); // Очистка перед отрисовкой

//     const width = window.innerWidth;
//     const height = window.innerHeight;

//     const minX = d3.min(systemsData, (d) => d.x) || 0;
//     const maxX = d3.max(systemsData, (d) => d.x) || 1;
//     const minY = d3.min(systemsData, (d) => d.y) || 0;
//     const maxY = d3.max(systemsData, (d) => d.y) || 1;

//     const scaleX = d3.scaleLinear().domain([minX, maxX]).range([50, width - 50]);
//     const scaleY = d3.scaleLinear().domain([minY, maxY]).range([50, height - 50]);

//     const zoom = d3.zoom()
//       .scaleExtent([0.5, 5])
//       .on("zoom", (event) => {
//         g.attr("transform", event.transform);
//       });

//     svg.call(zoom);

//     const g = svg.append("g");

//     g.selectAll("circle")
//       .data(systemsData)
//       .enter()
//       .append("circle")
//       .attr("cx", (d) => scaleX(d.x))
//       .attr("cy", (d) => scaleY(d.y))
//       .attr("r", 1)
//       .attr("fill", "yellow");

//   }, []);

//   return (
//     <svg
//       ref={svgRef}
//       width="100vw"
//       height="100vh"
//       style={{ display: "block", background: "black" }}
//     />
//   );
// };

// export default StarMap;



// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import systemsData from "../data/Systems.json";

// interface System {
//   itemID: number;
//   itemName: string;
//   x: number;
//   y: number;
//   z: number;
// }

// const StarMap: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const [zoom, setZoom] = useState(1); // Стейт для масштаба
//   const [offset, setOffset] = useState({ x: 0, y: 0 }); // Смещение для перемещения карты
//   const isDragging = useRef(false);
//   const lastMousePos = useRef({ x: 0, y: 0 });

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     if (!ctx) {
//       console.error("Ошибка: Не удалось получить контекст canvas.");
//       return;
//     }

//     // Устанавливаем размер canvas
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     console.log(`Canvas size: ${canvas.width}x${canvas.height}`);

//     // Определяем границы карты
//     const minX = Math.min(...systemsData.map((s) => s.x));
//     const maxX = Math.max(...systemsData.map((s) => s.x));
//     const minY = Math.min(...systemsData.map((s) => s.y));
//     const maxY = Math.max(...systemsData.map((s) => s.y));

//     const rangeX = maxX - minX;
//     const rangeY = maxY - minY;

//     console.log(`X range: ${minX} - ${maxX} (Δ${rangeX})`);
//     console.log(`Y range: ${minY} - ${maxY} (Δ${rangeY})`);

//     if (rangeX === 0 || rangeY === 0) {
//       console.error("Ошибка: Все системы находятся в одной точке!");
//       return;
//     }

//     // Масштабирование с учетом зума
//     const padding = 100; 
//     const scaleX = (canvas.width - padding * 2) / rangeX * zoom;
//     const scaleY = (canvas.height - padding * 2) / rangeY * zoom * 1.5;
//     const scale = Math.min(scaleX, scaleY);
//     console.log(`Scale factor: ${scale}`);

//     // Вычисляем смещение для центрирования карты
//     const offsetX = -minX * scale + padding + offset.x;
//     const offsetY = -minY * scale + padding + offset.y;
//     console.log(`Offset: (${offsetX}, ${offsetY})`);

//     // Функция для рисования звезд (систем)
//     const drawStars = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
      
//       systemsData.forEach((system) => {
//         const normalizedX = system.x * scale + offsetX;
//         const normalizedY = system.y * scale + offsetY;

//         ctx.beginPath();
//         ctx.arc(normalizedX, normalizedY, 3, 0, Math.PI * 2);
//         ctx.fillStyle = "yellow";
//         ctx.fill();
//         ctx.closePath();
//       });
//     };

//     drawStars();
//   }, [zoom, offset]);

//   // Обработчик колеса мыши для зума
//   const handleWheel = (event: WheelEvent) => {
//     setZoom((prevZoom) => Math.max(0.5, Math.min(prevZoom + event.deltaY * -0.001, 3)));
//   };

//   // Обработчики мыши для перемещения карты
//   const handleMouseDown = (event: React.MouseEvent) => {
//     isDragging.current = true;
//     lastMousePos.current = { x: event.clientX, y: event.clientY };
//   };

//   const handleMouseMove = (event: React.MouseEvent) => {
//     if (!isDragging.current) return;
//     setOffset((prevOffset) => ({
//       x: prevOffset.x + (event.clientX - lastMousePos.current.x),
//       y: prevOffset.y + (event.clientY - lastMousePos.current.y),
//     }));
//     lastMousePos.current = { x: event.clientX, y: event.clientY };
//   };

//   const handleMouseUp = () => {
//     isDragging.current = false;
//   };

//   return (
//     <canvas
//       ref={canvasRef}
//       onWheel={(e) => handleWheel(e as unknown as WheelEvent)}
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//       onMouseLeave={handleMouseUp}
//       style={{
//         display: "block",
//         position: "absolute",
//         top: 0,
//         left: 0,
//         width: "100vw",
//         height: "100vh",
//         cursor: "grab",
//       }}
//     />
//   );
// };

// export default StarMap;








// "use client";
// import React, { useEffect, useRef } from "react";
// import systemsData from "../data/Systems.json";

// interface System {
//   itemID: number;
//   itemName: string;
//   x: number;
//   y: number;
//   z: number;
// }

// const StarMap: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     if (!ctx) {
//       console.error("Ошибка: Не удалось получить контекст canvas.");
//       return;
//     }

//     // Увеличение размеров canvas для лучшей детализации
//     const scaleMultiplier = 2; // Увеличиваем масштаб в 2 раза
//     canvas.width = window.innerWidth * scaleMultiplier;
//     canvas.height = window.innerHeight * scaleMultiplier;
//     console.log(`Canvas size: ${canvas.width}x${canvas.height}`);

//     // Определение границ карты
//     const minX = Math.min(...systemsData.map((s) => s.x));
//     const maxX = Math.max(...systemsData.map((s) => s.x));
//     const minY = Math.min(...systemsData.map((s) => s.y));
//     const maxY = Math.max(...systemsData.map((s) => s.y));

//     const rangeX = maxX - minX;
//     const rangeY = maxY - minY;

//     console.log(`X range: ${minX} - ${maxX} (Δ${rangeX})`);
//     console.log(`Y range: ${minY} - ${maxY} (Δ${rangeY})`);

//     if (rangeX === 0 || rangeY === 0) {
//       console.error("Ошибка: Все системы находятся в одной точке!");
//       return;
//     }

//     // Подгоняем масштаб к размеру экрана, увеличиваем высоту
//     const padding = 50; // Увеличенные отступы
//     const scaleX = (canvas.width - padding * 2) / rangeX;
//     const scaleY = (canvas.height - padding * 2) / rangeY * 1.5; // Увеличиваем масштаб по Y
//     const scale = Math.min(scaleX, scaleY);
//     console.log(`Scale factor: ${scale}`);

//     // Центрирование
//     const offsetX = -minX * scale + padding;
//     const offsetY = -minY * scale + padding;
//     console.log(`Offset: (${offsetX}, ${offsetY})`);

//     // Функция для рисования звезд
//     const drawStars = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       systemsData.forEach((system) => {
//         const normalizedX = system.x * scale + offsetX;
//         const normalizedY = system.y * scale + offsetY;

//         ctx.beginPath();
//         ctx.arc(normalizedX, normalizedY, 3, 0, Math.PI * 2); // Увеличиваем размер звёзд
//         ctx.fillStyle = "yellow";
//         ctx.fill();
//         ctx.closePath();
//       });
//     };

//     drawStars();
//   }, []);

//   return <canvas ref={canvasRef} style={{ display: "block", position: "absolute", top: 0, left: 0, width: "100vw", height: "100vh" }} />;
// };

// export default StarMap;




// "use client";
// import React, { useEffect, useRef } from "react";
// import systemsData from "../data/Systems.json";


// const StarMap: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     if (!ctx) {
//       console.error("Ошибка: Не удалось получить контекст canvas.");
//       return;
//     }

//     // Настройка размеров canvas
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     console.log(`Canvas size: ${canvas.width}x${canvas.height}`);

//     // Определение границ карты
//     const minX = Math.min(...systemsData.map((s) => s.x));
//     const maxX = Math.max(...systemsData.map((s) => s.x));
//     const minY = Math.min(...systemsData.map((s) => s.y));
//     const maxY = Math.max(...systemsData.map((s) => s.y));

//     const rangeX = maxX - minX;
//     const rangeY = maxY - minY;

//     console.log(`X range: ${minX} - ${maxX} (Δ${rangeX})`);
//     console.log(`Y range: ${minY} - ${maxY} (Δ${rangeY})`);

//     if (rangeX === 0 || rangeY === 0) {
//       console.error("Ошибка: Все системы находятся в одной точке!");
//       return;
//     }

//     // Подгоняем масштаб к размеру экрана, увеличиваем высоту
//     const padding = 50; // Отступы по краям
//     const scaleX = (canvas.width - padding * 2) / rangeX * 0.9; // Уменьшаем масштаб по X
//     const scaleY = (canvas.height - padding * 2) / rangeY * 1.5; // Увеличиваем масштаб по Y
//     const scale = Math.min(scaleX, scaleY);
//     console.log(`Scale factor: ${scale}`);

//     // Центрирование
//     const offsetX = -minX * scale + padding;
//     const offsetY = -minY * scale + padding;
//     console.log(`Offset: (${offsetX}, ${offsetY})`);

//     // Функция для рисования звезд
//     const drawStars = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       systemsData.forEach((system) => {
//         const normalizedX = system.x * scale + offsetX;
//         const normalizedY = system.y * scale + offsetY;

//         ctx.beginPath();
//         ctx.arc(normalizedX, normalizedY, 2, 0, Math.PI * 2);
//         ctx.fillStyle = "yellow";
//         ctx.fill();
//         ctx.closePath();
//       });
//     };

//     drawStars();
//   }, []);

//   return <canvas ref={canvasRef} style={{ display: "block", position: "absolute", top: 0, left: 0 }} />;
// };

// export default StarMap;





// "use client";
// import React, { useEffect, useRef } from "react";
// import systemsData from "../data/Systems.json"; // Импорт JSON файла

// interface System {
//   itemID: number;
//   itemName: string;
//   x: number;
//   y: number;
//   z: number;
// }

// const StarMap: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     if (!ctx) {
//       console.error("Ошибка: Не удалось получить контекст canvas.");
//       return;
//     }

//     // Настройка размеров canvas
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     // Определение границ карты
//     const minX = Math.min(...systemsData.map((s) => s.x));
//     const maxX = Math.max(...systemsData.map((s) => s.x));
//     const minY = Math.min(...systemsData.map((s) => s.y));
//     const maxY = Math.max(...systemsData.map((s) => s.y));

//     const rangeX = maxX - minX;
//     const rangeY = maxY - minY;

//     if (rangeX === 0 || rangeY === 0) {
//       console.error("Ошибка: Все системы находятся в одной точке!");
//       return;
//     }

//     // Масштабирование
//     const scaleFactor = 1e-15; // Уменьшаем масштабы координат
//     const normalizedRangeX = rangeX * scaleFactor;
//     const normalizedRangeY = rangeY * scaleFactor;

//     // Подгоняем масштаб к размеру экрана
//     const scaleX = canvas.width / normalizedRangeX;
//     const scaleY = canvas.height / normalizedRangeY;
//     const scale = Math.min(scaleX, scaleY) * 1; // Немного увеличиваем масштаб

//     // Центрируем карту
//     const centerX = canvas.width / 20;
//     const centerY = canvas.height / 20;

//     // Функция для рисования звезд
//     const drawStars = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       systemsData.forEach((system) => {
//         // Применяем масштабирование и центрирование
//         const normalizedX = (system.x - minX) * scaleFactor * scale + centerX;
//         const normalizedY = (system.y - minY) * scaleFactor * scale + centerY;

//         ctx.beginPath();
//         const starSize = 1 + Math.random() * 1; // Размер от 1 до 3 пикселей
//         ctx.arc(normalizedX, normalizedY, starSize, 0, Math.PI * 2);
//         ctx.fillStyle = "yellow"; // Цвет звезд
//         ctx.fill();
//         ctx.closePath();
//       });
//     };

//     drawStars();

//     return () => {};
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         display: "block",
//         position: "absolute",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "100%",
//       }}
//     />
//   );
// };

// export default StarMap;




// "use client";
// import React, { useEffect, useRef } from "react";
// import systemsData from "../data/Systems.json"; // Импорт JSON файла

// interface System {
//   itemID: number;
//   itemName: string;
//   x: number;
//   y: number;
//   z: number;
// }

// const StarMap: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     if (!ctx) {
//       console.error("Ошибка: Не удалось получить контекст canvas.");
//       return;
//     }

//     // Настройка размеров canvas
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     // Определение границ карты
//     const minX = Math.min(...systemsData.map((s) => s.x));
//     const maxX = Math.max(...systemsData.map((s) => s.x));
//     const minY = Math.min(...systemsData.map((s) => s.y));
//     const maxY = Math.max(...systemsData.map((s) => s.y));

//     const rangeX = maxX - minX;
//     const rangeY = maxY - minY;

//     if (rangeX === 0 || rangeY === 0) {
//       console.error("Ошибка: Все системы находятся в одной точке!");
//       return;
//     }

//     // Выбираем нормализующий коэффициент
//     const scaleFactor = 1e-15; // Уменьшаем масштабы координат
//     const normalizedRangeX = rangeX * scaleFactor;
//     const normalizedRangeY = rangeY * scaleFactor;

//     // Подгоняем масштаб к размеру экрана
//     const scaleX = canvas.width / normalizedRangeX;
//     const scaleY = canvas.height / normalizedRangeY;
//     const scale = Math.min(scaleX, scaleY) *11 * 0.9; // Увеличиваем масштаб

//     // Определяем центр
//     const centerX = canvas.width / 10;
//     const centerY = canvas.height / 10;

//     // Функция для рисования звезд
//     const drawStars = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       systemsData.forEach((system) => {
//         // Применяем масштабирование и центрирование
//         const normalizedX = (system.x - minX) * scaleFactor * scale + centerX;
//         const normalizedY = (system.y - minY) * scaleFactor * scale + centerY;

//         ctx.beginPath();
//         const starSize = 0 + Math.random() * 1; // Размер от 0 до 2 пикселей
//         ctx.arc(normalizedX, normalizedY, starSize, 0, Math.PI * 2);
//         ctx.fillStyle = "yellow"; // Цвет звезд
//         ctx.fill();
//         ctx.closePath();
//       });
//     };

//     drawStars();

//     // Обработчик для подсветки системы при наведении
//     const handleMouseMove = (event: MouseEvent) => {
//       const rect = canvas.getBoundingClientRect();
//       const mouseX = event.clientX - rect.left;
//       const mouseY = event.clientY - rect.top;

//       systemsData.forEach((system) => {
//         const normalizedX = (system.x - minX) * scaleFactor * scale + centerX;
//         const normalizedY = (system.y - minY) * scaleFactor * scale + centerY;

//         const distance = Math.hypot(mouseX - normalizedX, mouseY - normalizedY);
//         if (distance < 10) {
//           // console.log(`Наведена система: ${system.itemName}`);
//         }
//       });
//     };

//     canvas.addEventListener("mousemove", handleMouseMove);

//     return () => {
//       canvas.removeEventListener("mousemove", handleMouseMove);
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         display: "block",
//         position: "absolute",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "100%",
//       }}
//     />
//   );
// };

// export default StarMap;





// // components/StarMap.tsx

// "use client";
// import React, { useEffect, useRef } from "react";
// import systemsData from "../data/Systems.json"; // Импорт JSON файла

// interface System {
//   itemID: number;
//   itemName: string;
//   x: number;
//   y: number;
//   z: number;
// }

// const StarMap: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     if (!ctx) {
//       console.error("Ошибка: Не удалось получить контекст canvas.");
//       return;
//     }

//     // Настройка размеров canvas
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     // Нормализация координат
//     const minX = Math.min(...(systemsData as System[]).map((s) => s.x));
//     const maxX = Math.max(...(systemsData as System[]).map((s) => s.x));
//     const minY = Math.min(...(systemsData as System[]).map((s) => s.y));
//     const maxY = Math.max(...(systemsData as System[]).map((s) => s.y));

//     const rangeX = maxX - minX;
//     const rangeY = maxY - minY;

//     // Проверка на нулевой диапазон
//     if (rangeX === 0 || rangeY === 0) {
//       console.error("Ошибка: Все системы находятся в одной точке!");
//       return;
//     }

//     // Увеличенный scaleFactor для больших значений координат
//     const scaleFactor = Math.max(rangeX, rangeY) > 1e16 ? 1e-16 : 1e-12;

//     // Масштабируем диапазон координат
//     const scaledRangeX = rangeX * scaleFactor;
//     const scaledRangeY = rangeY * scaleFactor;

//     // Рассчитываем масштаб для canvas
//     const scaleX = canvas.width / scaledRangeX;
//     const scaleY = canvas.height / scaledRangeY;
//     const minScale = 0.001;
//     const scale = Math.max(Math.min(scaleX, scaleY) * 15, minScale); // Увеличенный масштаб

//     // Функция для рисования звезд
//     const drawStars = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       (systemsData as System[]).forEach((system) => {
//         // Применяем масштабирование и центрирование
//         const normalizedX =
//           ((system.x - minX) * scaleFactor * scale) + canvas.width / 2;
//         const normalizedY =
//           ((system.y - minY) * scaleFactor * scale) + canvas.height / 2;

//         // Логирование для отладки
//         console.log(
//           `Система: ${system.itemName}, Scaled Position: (${normalizedX}, ${normalizedY})`
//         );

//         // Ограничение звезд внутри экрана
//         if (
//           normalizedX >= 0 &&
//           normalizedX <= canvas.width &&
//           normalizedY >= 0 &&
//           normalizedY <= canvas.height
//         ) {
//           // Рисуем звезду
//           ctx.beginPath();
//           const starSize = 1 + Math.random() * 3; // Случайный размер от 1 до 4
//           ctx.arc(normalizedX, normalizedY, starSize, 0, Math.PI * 2);
//           ctx.fillStyle = "yellow"; // Желтый цвет
//           ctx.fill();
//           ctx.closePath();
//         }
//       });
//     };

//     // Рисуем звезды
//     drawStars();

//     // Интерактивность: Подсветка звезд при наведении
//     const handleMouseMove = (event: MouseEvent) => {
//       const rect = canvas.getBoundingClientRect();
//       const mouseX = event.clientX - rect.left;
//       const mouseY = event.clientY - rect.top;

//       (systemsData as System[]).forEach((system) => {
//         const normalizedX =
//           ((system.x - minX) * scaleFactor * scale) + canvas.width / 2;
//         const normalizedY =
//           ((system.y - minY) * scaleFactor * scale) + canvas.height / 2;

//         // Проверяем, находится ли курсор мыши над звездой
//         const distance = Math.hypot(mouseX - normalizedX, mouseY - normalizedY);
//         if (distance < 10) {
//           console.log(`Наведена система: ${system.itemName}`);
//         }
//       });
//     };

//     // Добавляем обработчик события
//     canvas.addEventListener("mousemove", handleMouseMove);

//     // Удаляем обработчик при размонтировании компонента
//     return () => {
//       canvas.removeEventListener("mousemove", handleMouseMove);
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         display: "block",
//         position: "absolute",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "100%",
//         border: "1px solid black", // Граница для визуальной проверки
//       }}
//     />
//   );
// };

// export default StarMap;



// // components/StarMap.tsx

// "use client";
// import React, { useEffect, useRef } from "react";
// import systemsData from "../data/Systems.json"; // Импорт JSON файла

// interface System {
//   itemID: number;
//   itemName: string;
//   x: number;
//   y: number;
//   z: number;
// }

// const StarMap: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     if (!ctx) {
//       console.error("Ошибка: Не удалось получить контекст canvas.");
//       return;
//     }

//     // Настройка размеров canvas
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     // Нормализация координат
//     const minX = Math.min(...(systemsData as System[]).map((s) => s.x));
//     const maxX = Math.max(...(systemsData as System[]).map((s) => s.x));
//     const minY = Math.min(...(systemsData as System[]).map((s) => s.y));
//     const maxY = Math.max(...(systemsData as System[]).map((s) => s.y));

//     const rangeX = maxX - minX;
//     const rangeY = maxY - minY;

//     // Проверка на нулевой диапазон
//     if (rangeX === 0 || rangeY === 0) {
//       console.error("Ошибка: Все системы находятся в одной точке!");
//       return;
//     }

//     // Увеличенный scaleFactor для больших значений координат
//     // const scaleFactor = 1e-17; // Сжимаем координаты до приемлемого диапазона
//     const scaleFactor = Math.max(rangeX, rangeY) > 1e16 ? 1e-16 : 1e-12;

//     // Масштабируем диапазон координат
//     const scaledRangeX = rangeX * scaleFactor;
//     const scaledRangeY = rangeY * scaleFactor;

//     // Рассчитываем масштаб для canvas
//     const scaleX = canvas.width / scaledRangeX;
//     const scaleY = canvas.height / scaledRangeY;
//     // const scale = Math.min(scaleX, scaleY) * 0.9; // Масштаб с небольшим отступом
//     // const scale = (scaleX + scaleY) / 2 * 10;
//     const minScale = 0.001;
//     const scale = Math.max(Math.min(scaleX, scaleY) * 10, minScale);

//     // Функция для рисования звезд
//     const drawStars = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       (systemsData as System[]).forEach((system) => {
//         // Применяем масштабирование и центрирование
//         const normalizedX =
//           ((system.x - minX) * scaleFactor * scale) + canvas.width / 2;
//         const normalizedY =
//           ((system.y - minY) * scaleFactor * scale) + canvas.height / 2;

//         // Ограничение звезд внутри экрана
//         if (
//           normalizedX >= 0 &&
//           normalizedX <= canvas.width &&
//           normalizedY >= 0 &&
//           normalizedY <= canvas.height
//         ) {
//           // Рисуем звезду
//           ctx.beginPath();
//           // ctx.arc(normalizedX, normalizedY, 5, 0, Math.PI * 2); // Звезда радиусом 5
          
//           //!тут поработать 
//           const starSize = 1 + Math.random() * 3; // Случайный размер от 5 до 10
//           ctx.arc(normalizedX, normalizedY, starSize, 0, Math.PI * 2);
          
          
//           ctx.fillStyle = "yellow"; // Желтый цвет
//           ctx.fill();
//           ctx.closePath();
//         }
//       });
//     };

//     // Рисуем звезды
//     drawStars();

//     // Интерактивность: Подсветка звезд при наведении
//     const handleMouseMove = (event: MouseEvent) => {
//       const rect = canvas.getBoundingClientRect();
//       const mouseX = event.clientX - rect.left;
//       const mouseY = event.clientY - rect.top;

//       (systemsData as System[]).forEach((system) => {
//         const normalizedX =
//           ((system.x - minX) * scaleFactor * scale) + canvas.width / 2;
//         const normalizedY =
//           ((system.y - minY) * scaleFactor * scale) + canvas.height / 2;

//         // Проверяем, находится ли курсор мыши над звездой
//         const distance = Math.hypot(mouseX - normalizedX, mouseY - normalizedY);
//         if (distance < 10) {
//           console.log(`Наведена система: ${system.itemName}`);
//         }
//       });
//     };

//     // Добавляем обработчик события
//     canvas.addEventListener("mousemove", handleMouseMove);

//     // Удаляем обработчик при размонтировании компонента
//     return () => {
//       canvas.removeEventListener("mousemove", handleMouseMove);
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         display: "block",
//         position: "absolute",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "100%",
//         border: "1px solid black", // Граница для визуальной проверки
//       }}
//     />
//   );
// };

// export default StarMap;