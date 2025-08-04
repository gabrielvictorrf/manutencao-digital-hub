import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  loadOrdens, saveOrdens,
  loadMaquinas, saveMaquinas,
  loadTemposParada, saveTemposParada,
  loadRequisitantes, saveRequisitantes,
  loadSetores, saveSetores,
  Requisitante, Setor
} from '@/lib/storage';
import { OrdemServico } from '@/pages/OrdensServico';
import { Maquina } from '@/pages/Maquinas';
import { TempoParada } from '@/pages/TemposParada';

export interface TipoEquipamento {
  id: string;
  nome: string;
  categoria: string;
  descricao?: string;
  criadoEm: string;
  criadoPor: string;
}

interface Tecnico {
  id: string;
  nome: string;
  especialidade: string;
  turno: string;
  valorHora: number;
  horasTrabalhadasMes: number;
  ordensCompletas: number;
  status: "Ativo" | "Inativo" | "Férias";
}

interface Turno {
  id: string;
  nome: string;
  horaInicio: string;
  horaFim: string;
  diasSemana: string[];
  criadoEm: string;
  criadoPor: string;
}

interface Especialidade {
  id: string;
  nome: string;
  valorHora: number;
  criadoEm: string;
  criadoPor: string;
}

interface DataContextType {
  // Ordens de Serviço
  ordens: OrdemServico[];
  setOrdens: (ordens: OrdemServico[]) => void;
  addOrdem: (ordem: OrdemServico) => void;
  updateOrdem: (id: string, ordem: Partial<OrdemServico>) => void;
  deleteOrdem: (id: string) => void;
  
  // Máquinas
  maquinas: Maquina[];
  setMaquinas: (maquinas: Maquina[]) => void;
  addMaquina: (maquina: Maquina) => void;
  updateMaquina: (id: string, maquina: Partial<Maquina>) => void;
  
  // Tempos de Parada
  temposParada: TempoParada[];
  setTemposParada: (tempos: TempoParada[]) => void;
  addTempoParada: (tempo: TempoParada) => void;
  updateTempoParada: (id: string, tempo: Partial<TempoParada>) => void;
  deleteTempoParada: (id: string) => void;
  
  // Técnicos
  tecnicos: Tecnico[];
  setTecnicos: (tecnicos: Tecnico[]) => void;
  addTecnico: (tecnico: Tecnico) => void;
  updateTecnico: (id: string, tecnico: Partial<Tecnico>) => void;
  deleteTecnico: (id: string) => void;
  
  // Turnos
  turnos: Turno[];
  setTurnos: (turnos: Turno[]) => void;
  addTurno: (turno: Turno) => void;
  updateTurno: (id: string, turno: Partial<Turno>) => void;
  deleteTurno: (id: string) => void;
  
  // Especialidades
  especialidades: Especialidade[];
  setEspecialidades: (especialidades: Especialidade[]) => void;
  addEspecialidade: (especialidade: Especialidade) => void;
  updateEspecialidade: (id: string, especialidade: Partial<Especialidade>) => void;
  deleteEspecialidade: (id: string) => void;
  
  // Requisitantes
  requisitantes: Requisitante[];
  setRequisitantes: (requisitantes: Requisitante[]) => void;
  addRequisitante: (requisitante: Requisitante) => void;
  updateRequisitante: (id: string, requisitante: Partial<Requisitante>) => void;
  
  // Setores
  setores: Setor[];
  setSetores: (setores: Setor[]) => void;
  addSetor: (setor: Setor) => void;
  updateSetor: (id: string, setor: Partial<Setor>) => void;
  deleteSetor: (id: string) => void;
  
  // Tipos de Equipamento
  tiposEquipamento: TipoEquipamento[];
  setTiposEquipamento: (tipos: TipoEquipamento[]) => void;
  addTipoEquipamento: (tipo: TipoEquipamento) => void;
  updateTipoEquipamento: (id: string, tipo: Partial<TipoEquipamento>) => void;
  deleteTipoEquipamento: (id: string) => void;
  
  // Setores fabris
  setoresFabris: string[];
  
  // Método para sincronizar tudo
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Setores da empresa (fabril)
export const setoresFabris = [
  "Cálcio Dihidratado",
  "Cálcio solução", 
  "Magnésio Hexahidratado",
  "Magnésio Solução",
  "Cálcio Solução - Polimento",
  "Ácido Clorídrico",
  "Cálcio Solução Reação",
  "Cálcio Solução Ênvase",
  "Balança Rodoviária",
  "Escritório Adm",
  "Portaria",
  "Casa de bomba de incêndio",
  "Poço Artesiano",
  "Almoxarifado",
  "Outros"
];

// Setores dos requisitantes
export const setoresRequisitantes = [
  "Qualidade",
  "Gerência", 
  "Diretoria",
  "Supervisão de produção",
  "Supervisão de manutenção",
  "Segurança e Meio Ambiente",
  "RH",
  "Compras",
  "Contabilidade",
  "Financeiro",
  "Secretaria",
  "Vendas"
];

// Dados iniciais dos turnos
const turnosIniciais: Turno[] = [
  {
    id: "1",
    nome: "Primeiro Turno",
    horaInicio: "06:00",
    horaFim: "14:00",
    diasSemana: ["segunda", "terça", "quarta", "quinta", "sexta"],
    criadoEm: new Date().toISOString(),
    criadoPor: "Sistema"
  },
  {
    id: "2", 
    nome: "Segundo Turno",
    horaInicio: "14:00",
    horaFim: "22:00", 
    diasSemana: ["segunda", "terça", "quarta", "quinta", "sexta"],
    criadoEm: new Date().toISOString(),
    criadoPor: "Sistema"
  },
  {
    id: "3",
    nome: "Terceiro Turno",
    horaInicio: "22:00",
    horaFim: "06:00",
    diasSemana: ["segunda", "terça", "quarta", "quinta", "sexta"],
    criadoEm: new Date().toISOString(),
    criadoPor: "Sistema"
  }
];

// Dados iniciais das especialidades
const especialidadesIniciais: Especialidade[] = [
  {
    id: "1",
    nome: "Mecânica",
    valorHora: 25.00,
    criadoEm: new Date().toISOString(),
    criadoPor: "Sistema"
  },
  {
    id: "2",
    nome: "Elétrica", 
    valorHora: 30.00,
    criadoEm: new Date().toISOString(),
    criadoPor: "Sistema"
  },
  {
    id: "3",
    nome: "Hidráulica",
    valorHora: 22.00,
    criadoEm: new Date().toISOString(),
    criadoPor: "Sistema"
  },
  {
    id: "4",
    nome: "Soldagem",
    valorHora: 35.00,
    criadoEm: new Date().toISOString(),
    criadoPor: "Sistema"
  }
];

// Dados iniciais dos técnicos
const tecnicosIniciais: Tecnico[] = [
  {
    id: "1",
    nome: "João Silva",
    especialidade: "Mecânica",
    turno: "Primeiro Turno",
    valorHora: 25.00,
    horasTrabalhadasMes: 168,
    ordensCompletas: 0,
    status: "Ativo"
  },
  {
    id: "2",
    nome: "Maria Santos",
    especialidade: "Elétrica",
    turno: "Segundo Turno",
    valorHora: 30.00,
    horasTrabalhadasMes: 160,
    ordensCompletas: 0,
    status: "Ativo"
  },
  {
    id: "3",
    nome: "Carlos Lima",
    especialidade: "Hidráulica",
    turno: "Primeiro Turno",
    valorHora: 22.00,
    horasTrabalhadasMes: 155,
    ordensCompletas: 0,
    status: "Férias"
  },
  {
    id: "4",
    nome: "Ana Costa",
    especialidade: "Soldagem",
    turno: "Terceiro Turno",
    valorHora: 35.00,
    horasTrabalhadasMes: 172,
    ordensCompletas: 0,
    status: "Ativo"
  }
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [ordens, setOrdensState] = useState<OrdemServico[]>([]);
  const [maquinas, setMaquinasState] = useState<Maquina[]>([]);
  const [temposParada, setTemposParadaState] = useState<TempoParada[]>([]);
  const [tecnicos, setTecnicosState] = useState<Tecnico[]>(tecnicosIniciais);
  const [requisitantes, setRequisitantesState] = useState<Requisitante[]>([]);
  const [setores, setSetoresState] = useState<Setor[]>([]);
  const [tiposEquipamento, setTiposEquipamentoState] = useState<TipoEquipamento[]>([]);
  const [turnos, setTurnosState] = useState<Turno[]>(turnosIniciais);
  const [especialidades, setEspecialidadesState] = useState<Especialidade[]>(especialidadesIniciais);

  // Carregar dados iniciais
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const ordensCarregadas = loadOrdens();
    const maquinasCarregadas = loadMaquinas();
    const temposCarregados = loadTemposParada();
    const requisitantesCarregados = loadRequisitantes();
    const setoresCarregados = loadSetores();
    const tiposCarregados = JSON.parse(localStorage.getItem('tiposEquipamento') || '[]');
    const turnosCarregados = JSON.parse(localStorage.getItem('turnos') || '[]');
    const especialidadesCarregadas = JSON.parse(localStorage.getItem('especialidades') || '[]');

    setOrdensState(ordensCarregadas);
    setMaquinasState(maquinasCarregadas);
    setTemposParadaState(temposCarregados);
    setRequisitantesState(requisitantesCarregados);
    setSetoresState(setoresCarregados);
    setTiposEquipamentoState(tiposCarregados);
    setTurnosState(turnosCarregados.length > 0 ? turnosCarregados : turnosIniciais);
    setEspecialidadesState(especialidadesCarregadas.length > 0 ? especialidadesCarregadas : especialidadesIniciais);

    // Atualizar contador de ordens dos técnicos
    const ordensCountPorTecnico = ordensCarregadas.reduce((acc: Record<string, number>, ordem) => {
      if (ordem.tecnicoResponsavelId) {
        acc[ordem.tecnicoResponsavelId] = (acc[ordem.tecnicoResponsavelId] || 0) + 1;
      }
      return acc;
    }, {});

    setTecnicosState(prev => 
      prev.map(tecnico => ({
        ...tecnico,
        ordensCompletas: ordensCountPorTecnico[tecnico.id] || 0
      }))
    );
  };

  // Funções para Ordens
  const setOrdens = (novasOrdens: OrdemServico[]) => {
    setOrdensState(novasOrdens);
    saveOrdens(novasOrdens);
    refreshData(); // Refresh para atualizar contadores
  };

  const addOrdem = (ordem: OrdemServico) => {
    const novasOrdens = [...ordens, ordem];
    setOrdens(novasOrdens);
  };

  const updateOrdem = (id: string, ordemUpdate: Partial<OrdemServico>) => {
    const novasOrdens = ordens.map(ordem => 
      ordem.id === id ? { ...ordem, ...ordemUpdate } : ordem
    );
    setOrdens(novasOrdens);
  };

  const deleteOrdem = (id: string) => {
    const novasOrdens = ordens.filter(ordem => ordem.id !== id);
    setOrdens(novasOrdens);
  };

  // Funções para Máquinas
  const setMaquinas = (novasMaquinas: Maquina[]) => {
    setMaquinasState(novasMaquinas);
    saveMaquinas(novasMaquinas);
  };

  const addMaquina = (maquina: Maquina) => {
    const novasMaquinas = [...maquinas, maquina];
    setMaquinas(novasMaquinas);
  };

  const updateMaquina = (id: string, maquinaUpdate: Partial<Maquina>) => {
    const novasMaquinas = maquinas.map(maquina => 
      maquina.id === id ? { ...maquina, ...maquinaUpdate } : maquina
    );
    setMaquinas(novasMaquinas);
  };

  // Funções para Tempos de Parada
  const setTemposParada = (novosTempos: TempoParada[]) => {
    setTemposParadaState(novosTempos);
    saveTemposParada(novosTempos);
  };

  const addTempoParada = (tempo: TempoParada) => {
    const novosTempos = [...temposParada, tempo];
    setTemposParada(novosTempos);
  };

  const updateTempoParada = (id: string, tempoUpdate: Partial<TempoParada>) => {
    const novosTempos = temposParada.map(tempo => 
      tempo.id === id ? { ...tempo, ...tempoUpdate } : tempo
    );
    setTemposParada(novosTempos);
  };

  const deleteTempoParada = (id: string) => {
    const novosTempos = temposParada.filter(tempo => tempo.id !== id);
    setTemposParada(novosTempos);
  };

  // Funções para Técnicos
  const setTecnicos = (novosTecnicos: Tecnico[]) => {
    setTecnicosState(novosTecnicos);
  };

  const addTecnico = (tecnico: Tecnico) => {
    const novosTecnicos = [...tecnicos, tecnico];
    setTecnicos(novosTecnicos);
  };

  const updateTecnico = (id: string, tecnicoUpdate: Partial<Tecnico>) => {
    const novosTecnicos = tecnicos.map(tecnico => 
      tecnico.id === id ? { ...tecnico, ...tecnicoUpdate } : tecnico
    );
    setTecnicos(novosTecnicos);
  };

  const deleteTecnico = (id: string) => {
    const novosTecnicos = tecnicos.filter(tecnico => tecnico.id !== id);
    setTecnicos(novosTecnicos);
  };

  // Funções para Requisitantes
  const setRequisitantes = (novosRequisitantes: Requisitante[]) => {
    setRequisitantesState(novosRequisitantes);
    saveRequisitantes(novosRequisitantes);
  };

  const addRequisitante = (requisitante: Requisitante) => {
    const novosRequisitantes = [...requisitantes, requisitante];
    setRequisitantes(novosRequisitantes);
  };

  const updateRequisitante = (id: string, requisitanteUpdate: Partial<Requisitante>) => {
    const novosRequisitantes = requisitantes.map(req => 
      req.id === id ? { ...req, ...requisitanteUpdate } : req
    );
    setRequisitantes(novosRequisitantes);
  };

  // Funções para Setores
  const setSetores = (novosSetores: Setor[]) => {
    setSetoresState(novosSetores);
    saveSetores(novosSetores);
  };

  const addSetor = (setor: Setor) => {
    const novosSetores = [...setores, setor];
    setSetores(novosSetores);
  };

  const updateSetor = (id: string, setorUpdate: Partial<Setor>) => {
    const novosSetores = setores.map(setor => 
      setor.id === id ? { ...setor, ...setorUpdate } : setor
    );
    setSetores(novosSetores);
  };

  const deleteSetor = (id: string) => {
    const novosSetores = setores.filter(setor => setor.id !== id);
    setSetores(novosSetores);
  };

  // Funções para Tipos de Equipamento
  const setTiposEquipamento = (novosTipos: TipoEquipamento[]) => {
    setTiposEquipamentoState(novosTipos);
    localStorage.setItem('tiposEquipamento', JSON.stringify(novosTipos));
  };

  const addTipoEquipamento = (tipo: TipoEquipamento) => {
    const novosTipos = [...tiposEquipamento, tipo];
    setTiposEquipamento(novosTipos);
  };

  const updateTipoEquipamento = (id: string, tipoUpdate: Partial<TipoEquipamento>) => {
    const novosTipos = tiposEquipamento.map(tipo => 
      tipo.id === id ? { ...tipo, ...tipoUpdate } : tipo
    );
    setTiposEquipamento(novosTipos);
  };

  const deleteTipoEquipamento = (id: string) => {
    const novosTipos = tiposEquipamento.filter(tipo => tipo.id !== id);
    setTiposEquipamento(novosTipos);
  };

  // Funções para Turnos
  const setTurnos = (novosTurnos: Turno[]) => {
    setTurnosState(novosTurnos);
    localStorage.setItem('turnos', JSON.stringify(novosTurnos));
  };

  const addTurno = (turno: Turno) => {
    const novosTurnos = [...turnos, turno];
    setTurnos(novosTurnos);
  };

  const updateTurno = (id: string, turnoUpdate: Partial<Turno>) => {
    const novosTurnos = turnos.map(turno => 
      turno.id === id ? { ...turno, ...turnoUpdate } : turno
    );
    setTurnos(novosTurnos);
  };

  const deleteTurno = (id: string) => {
    const novosTurnos = turnos.filter(turno => turno.id !== id);
    setTurnos(novosTurnos);
  };

  // Funções para Especialidades
  const setEspecialidades = (novasEspecialidades: Especialidade[]) => {
    setEspecialidadesState(novasEspecialidades);
    localStorage.setItem('especialidades', JSON.stringify(novasEspecialidades));
  };

  const addEspecialidade = (especialidade: Especialidade) => {
    const novasEspecialidades = [...especialidades, especialidade];
    setEspecialidades(novasEspecialidades);
  };

  const updateEspecialidade = (id: string, especialidadeUpdate: Partial<Especialidade>) => {
    const novasEspecialidades = especialidades.map(especialidade => 
      especialidade.id === id ? { ...especialidade, ...especialidadeUpdate } : especialidade
    );
    setEspecialidades(novasEspecialidades);
  };

  const deleteEspecialidade = (id: string) => {
    const novasEspecialidades = especialidades.filter(especialidade => especialidade.id !== id);
    setEspecialidades(novasEspecialidades);
  };

  const value: DataContextType = {
    ordens, setOrdens, addOrdem, updateOrdem, deleteOrdem,
    maquinas, setMaquinas, addMaquina, updateMaquina,
    temposParada, setTemposParada, addTempoParada, updateTempoParada, deleteTempoParada,
    tecnicos, setTecnicos, addTecnico, updateTecnico, deleteTecnico,
    requisitantes, setRequisitantes, addRequisitante, updateRequisitante,
    setores, setSetores, addSetor, updateSetor, deleteSetor,
    tiposEquipamento, setTiposEquipamento, addTipoEquipamento, updateTipoEquipamento, deleteTipoEquipamento,
    turnos, setTurnos, addTurno, updateTurno, deleteTurno,
    especialidades, setEspecialidades, addEspecialidade, updateEspecialidade, deleteEspecialidade,
    setoresFabris,
    refreshData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}