


// // components/RoutePlanner.tsx
'use client';
import React, { useState, useRef } from 'react';
import axios from 'axios';
import * as d3 from 'd3';
import SystemsData from '../data/Systems.json';

// Определяем интерфейсы
interface System {
  itemID: number;
  itemName: string;
  x: number;
  y: number;
  z: number;
  security_status?: number;
}

interface Node {
  id: string;
  x: number;
  y: number;
  label: string;
  security_status: number;
}

interface Edge {
  source: string;
  target: string;
}

const RoutePlanner: React.FC = () => {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [routeType, setRouteType] = useState<'shortest' | 'secure' | 'insecure'>('shortest');
  const [nodes, setNodes] = useState<Node[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Флаги для показа/скрытия выпадающего списка
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  // Функция для поиска системы по ID
  const findSystemById = (id: number): System | undefined => {
    return SystemsData.find((system) => system.itemID === id);
  };

  // Функция для получения статуса безопасности системы
  const fetchSecurityStatus = async (systemId: number): Promise<number> => {
    try {
      const response = await axios.get(
        `https://esi.evetech.net/latest/universe/systems/${systemId}/`
      );
      return response.data.security_status || 0;
    } catch (error) {
      console.error('Error fetching security status:', error);
      return 0; // Возвращаем значение по умолчанию
    }
  };

  // Функция для получения маршрута между системами
  const fetchRoute = async () => {
    if (!origin || !destination) return;

    const originSystem = SystemsData.find((system) => system.itemName === origin);
    const destinationSystem = SystemsData.find((system) => system.itemName === destination);

    if (!originSystem || !destinationSystem) {
      alert('One or both systems not found!');
      return;
    }

    try {
      const response = await axios.get(
        `https://esi.evetech.net/latest/route/${originSystem.itemID}/${destinationSystem.itemID}/?flag=${routeType}`
      );

      const routeIds = response.data;

      // Получаем информацию о системах по их ID
      const routeSystems = await Promise.all(
        routeIds.map(async (id: number) => {
          const system = findSystemById(id);
          if (system) {
            const securityStatus = await fetchSecurityStatus(id);
            return {
              ...system,
              security_status: securityStatus,
              label: `${system.itemName} (${securityStatus.toFixed(2)})`,
            };
          }
          return null;
        })
      );

      // Создаем узлы с реальными координатами из Systems.json
      const newNodes = scaleAndCenterCoordinates(routeSystems.filter(Boolean) as System[]);

      setNodes(newNodes);
      drawGraph(newNodes); // Рисуем график
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        alert('No route found between the selected systems!');
      } else {
        console.error('Error fetching route:', error);
      }
    }
  };

  // Масштабирование и центрирование координат
  const scaleAndCenterCoordinates = (systems: System[]): Node[] => {
    const width = 800; // Ширина SVG
    const height = 500; // Высота SVG

    // Находим минимальные и максимальные значения x и y
    const minX = Math.min(...systems.map((s) => s.x));
    const maxX = Math.max(...systems.map((s) => s.x));
    const minY = Math.min(...systems.map((s) => s.y));
    const maxY = Math.max(...systems.map((s) => s.y));

    // Создаем масштабирующие функции
    const scaleX = d3.scaleLinear().domain([minX, maxX]).range([50, width - 50]);
    const scaleY = d3.scaleLinear().domain([minY, maxY]).range([50, height - 50]);

    // Масштабируем и центрируем координаты
    return systems.map((system) => ({
      id: system.itemName,
      x: scaleX(system.x) ?? 0,
      y: scaleY(system.y) ?? 0,
      label: `${system.itemName} (${(system.security_status || 0).toFixed(2)})`,
      security_status: system.security_status || 0,
    }));
  };

  // Функция для рисования графика с помощью D3.js
  const drawGraph = (nodes: Node[]) => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Очищаем SVG

    // Создаем последовательные связи между системами
    const edges: Edge[] = nodes.flatMap((_, index) => {
      if (index < nodes.length - 1) {
        return [{ source: nodes[index].id, target: nodes[index + 1].id }];
      }
      return [];
    });

    // Создаем маркер для стрелок
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10') // Размеры маркера
      .attr('refX', 15) // Расположение относительно конца линии
      .attr('refY', 0)
      .attr('markerWidth', 8) // Ширина маркера
      .attr('markerHeight', 8) // Высота маркера
      .attr('orient', 'auto') // Автоматическая ориентация
      .attr('fill', '#03a9f4') // Цвет маркера (голубой)
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5'); // Форма стрелки

    // Рисуем связи
    const link = svg
      .selectAll('.link')
      .data(edges)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#03a9f4')
      .attr('stroke-width', 1)
      .attr('marker-end', 'url(#arrow)');

    // Рисуем узлы
    const node = svg
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .on('mouseover', showLabel) // Показываем метку при наведении
      .on('mouseout', hideLabel) // Скрываем метку при уходе курсора
      .call(
        d3.drag<SVGGElement, Node>() // Исправляем типы drag
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
      );

    // Добавляем квадраты для узлов
    node
      .append('rect')
      .attr('width', 8)
      .attr('height', 8)
      .attr('fill', (d) => getNodeColor(d.security_status))
      .attr('stroke', '#03a9f4')
      .attr('stroke-width', 1);

    // Добавляем метки для узлов (скрытые по умолчанию)
    node
      .append('text')
      .attr('dx', 16) // Отступ от квадрата
      .attr('dy', '.35em')
      .text((d) => d.label)
      .style('fill', '#fff')
      .style('font-size', '10px')
      .style('display', 'none'); // Скрываем метки по умолчанию

    // Обновляем позиции узлов и связей
    updatePositions();

    // function updatePositions() {
    //   link
    //     .attr('x1', (d: Edge) => findNode(d.source)?.x + 4 || 0) // Защита от undefined
    //     .attr('y1', (d: Edge) => findNode(d.source)?.y + 4 || 0) // Защита от undefined
    //     .attr('x2', (d: Edge) => findNode(d.target)?.x + 4 || 0) // Защита от undefined
    //     .attr('y2', (d: Edge) => findNode(d.target)?.y + 4 || 0); // Защита от undefined

    //   node.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
    // }

    function updatePositions() {
      link
        .attr('x1', (d: Edge) => {
          const sourceNode = findNode(d.source);
          return sourceNode ? sourceNode.x + 4 : 0;
        })
        .attr('y1', (d: Edge) => {
          const sourceNode = findNode(d.source);
          return sourceNode ? sourceNode.y + 4 : 0;
        })
        .attr('x2', (d: Edge) => {
          const targetNode = findNode(d.target);
          return targetNode ? targetNode.x + 4 : 0;
        })
        .attr('y2', (d: Edge) => {
          const targetNode = findNode(d.target);
          return targetNode ? targetNode.y + 4 : 0;
        });

      node.attr('transform', (d: Node) => `translate(${d.x}, ${d.y})`);
    }

    function findNode(id: string): Node | undefined {
      return nodes.find((node) => node.id === id);
    }

    // Обработчики drag
    // function dragStarted(event: d3.D3DragEvent<SVGGElement, Node, unknown>, d: Node) {
    //   d3.select(event.sourceEvent?.target as SVGGElement).raise().classed('active', true);
    // }
    function dragStarted(event: d3.D3DragEvent<SVGGElement, Node, unknown>) {
      d3.select(event.sourceEvent?.target as SVGGElement).raise().classed('active', true);
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, unknown>, d: Node) {
      d.x = event.x;
      d.y = event.y;
      updatePositions();
    }

    function dragEnded(event: d3.D3DragEvent<SVGGElement, Node, unknown>) {
      d3.select(event.sourceEvent?.target as SVGGElement).classed('active', false);
    }

    // Показываем метку при наведении
    function showLabel(event: MouseEvent | TouchEvent) {
      const target = event.currentTarget as SVGGElement; // Приводим к типу SVG-элемента
      d3.select(target).select('text').style('display', 'block');
    }

    // Скрываем метку при уходе курсора
    function hideLabel(event: MouseEvent | TouchEvent) {
      const target = event.currentTarget as SVGGElement; // Приводим к типу SVG-элемента
      d3.select(target).select('text').style('display', 'none');
    }
  };

  // Функция для определения цвета узла в зависимости от security_status
  const getNodeColor = (securityStatus: number): string => {
    if (securityStatus > 0.5) return '#28a745'; // Зеленый для безопасных систем
    if (securityStatus >= 0.1) return '#ffc107'; // Желтый для нейтральных систем
    return '#dc3545'; // Красный для опасных систем
  };

  // Функция для автодополнения систем
  const handleSearchChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    showDropdownSetter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter(value);
    showDropdownSetter(true); // Показываем выпадающий список при вводе
  };

  const renderAutocomplete = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    placeholder: string,
    showDropdown: boolean,
    setShowDropdown: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const filteredSystems = SystemsData.filter((system) =>
      system.itemName.toLowerCase().includes(value.toLowerCase())
    );

    return (
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => handleSearchChange(e.target.value, setter, setShowDropdown)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Скрываем выпадающий список через таймаут
          onKeyDown={(e) => {
            if (e.key === 'Enter') setShowDropdown(false); // Скрываем при нажатии Enter
          }}
          className="w-full text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md py-2 px-2"
          placeholder={placeholder}
        />
        {showDropdown && value && filteredSystems.length > 0 && (
          <ul
            className="absolute w-full bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md mt-1 max-h-40 overflow-y-auto"
          >
            {filteredSystems.map((system) => (
              <li
                key={system.itemID}
                className="cursor-pointer py-2 px-3 hover:bg-slate-700"
                onClick={() => {
                  setter(system.itemName); // Устанавливаем выбранное значение
                  setShowDropdown(false); // Скрываем выпадающий список
                }}
              >
                {system.itemName}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-4 bg-slate-950 text-slate-300 max-md:px-5 bg-gradient-to-r from-[#04071D] via-[#04071D] to-[#0C0E23] border border-[rgba(105,113,162,0.16)] shadow-lg backdrop-blur-md transition-colors duration-300 rounded-lg">
      <h1 className="text-2xl font-bold">Route Planner</h1>

      {/* Выбор системы отправления и прибытия */}
      <div className="flex gap-4 justify-center items-center">
        <div>
          {renderAutocomplete(
            origin,
            setOrigin,
            'System Departure',
            showOriginDropdown,
            setShowOriginDropdown
          )}
        </div>
        <div>
          {renderAutocomplete(
            destination,
            setDestination,
            'System Arrival',
            showDestinationDropdown,
            setShowDestinationDropdown
          )}
        </div>

        <div className='flex flex-row gap-4'>
          {/* Выбор типа маршрута */}
          <div>
            <select
              value={routeType}
              onChange={(e) => setRouteType(e.target.value as 'shortest' | 'secure' | 'insecure')}
              className="w-full text-slate-300 bg-slate-800 border border-[rgba(105,113,162,0.4)] rounded-md py-3 px-3"
            >
              <option value="shortest">Shortest</option>
              <option value="secure">Secure</option>
              <option value="insecure">Insecure</option>
            </select>
          </div>

          {/* Кнопка для расчета маршрута */}
          <button
            onClick={fetchRoute}
            className="inline-flex gap-2 justify-center items-center px-2 py-2 text-sm font-medium tracking-tight leading-tight text-white rounded-[10px] border border-[rgba(105,113,162,0.4)] bg-gradient-to-r from-[#161A31] to-[#06091F] transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-gradient-to-r hover:from-[#06091F] hover:to-[#161A31] shadow-md hover:shadow-lg"
          >
            Calculate Route
          </button>
        </div>

      </div>


      <div className="flex flex-row items-center w-full p-4 gap-2">
        {/* SVG-контейнер для графика */}
        <svg ref={svgRef} className="w-full h-[500px] bg-transparent" />

        {/* Вывод списка систем маршрута */}
        {nodes.length > 0 && (
          <div className="flex flex-col space-y-2">
            <h2 className="text-lg font-semibold">Route Details:</h2>
            <ul className="space-y-1">
              {nodes.map((node) => (
                <li
                  key={node.id}
                  className="flex items-center gap-2"
                  style={{ color: getNodeColor(node.security_status) }}
                >
                  <span className="w-4 h-4 block rounded-sm" style={{ backgroundColor: getNodeColor(node.security_status) }}></span>
                  <span className="text-sm">{node.id}</span>
                  <span className="text-xs text-gray-400">({node.security_status.toFixed(2)})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>



    </div>
  );
};

export default RoutePlanner;

