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

interface Tecnico {
  id: string;
  nome: string;
  especialidade: string;
  nivel: string;
  horasTrabalhadasMes: number;
  ordensCompletas: number;
  status: "Ativo" | "Inativo" | "Férias";
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
  
  // Técnicos
  tecnicos: Tecnico[];
  setTecnicos: (tecnicos: Tecnico[]) => void;
  addTecnico: (tecnico: Tecnico) => void;
  updateTecnico: (id: string, tecnico: Partial<Tecnico>) => void;
  deleteTecnico: (id: string) => void;
  
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

// Dados iniciais dos técnicos
const tecnicosIniciais: Tecnico[] = [
  {
    id: "1",
    nome: "João Silva",
    especialidade: "Mecânica",
    nivel: "Sênior",
    horasTrabalhadasMes: 168,
    ordensCompletas: 0,
    status: "Ativo"
  },
  {
    id: "2",
    nome: "Maria Santos",
    especialidade: "Elétrica",
    nivel: "Pleno",
    horasTrabalhadasMes: 160,
    ordensCompletas: 0,
    status: "Ativo"
  },
  {
    id: "3",
    nome: "Carlos Lima",
    especialidade: "Hidráulica",
    nivel: "Júnior",
    horasTrabalhadasMes: 155,
    ordensCompletas: 0,
    status: "Férias"
  },
  {
    id: "4",
    nome: "Ana Costa",
    especialidade: "Soldagem",
    nivel: "Sênior",
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

    setOrdensState(ordensCarregadas);
    setMaquinasState(maquinasCarregadas);
    setTemposParadaState(temposCarregados);
    setRequisitantesState(requisitantesCarregados);
    setSetoresState(setoresCarregados);

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

  const value: DataContextType = {
    ordens, setOrdens, addOrdem, updateOrdem, deleteOrdem,
    maquinas, setMaquinas, addMaquina, updateMaquina,
    temposParada, setTemposParada, addTempoParada, updateTempoParada,
    tecnicos, setTecnicos, addTecnico, updateTecnico, deleteTecnico,
    requisitantes, setRequisitantes, addRequisitante, updateRequisitante,
    setores, setSetores, addSetor, updateSetor,
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