// Sistema de armazenamento local persistente
import { OrdemServico } from '@/pages/OrdensServico';
import { Maquina } from '@/pages/Maquinas';
import { TempoParada } from '@/pages/TemposParada';

const STORAGE_KEYS = {
  ORDENS_SERVICO: 'ordens_servico',
  MAQUINAS: 'maquinas',
  TEMPOS_PARADA: 'tempos_parada',
};

// Funções genéricas de armazenamento
export const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
};

export const loadFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error);
    return [];
  }
};

// Funções específicas para cada entidade
export const saveOrdens = (ordens: OrdemServico[]): void => {
  saveToStorage(STORAGE_KEYS.ORDENS_SERVICO, ordens);
};

export const loadOrdens = (): OrdemServico[] => {
  return loadFromStorage<OrdemServico>(STORAGE_KEYS.ORDENS_SERVICO);
};

export const saveMaquinas = (maquinas: Maquina[]): void => {
  saveToStorage(STORAGE_KEYS.MAQUINAS, maquinas);
};

export const loadMaquinas = (): Maquina[] => {
  const defaultMaquinas: Maquina[] = [
    {
      id: '1',
      codigo: 'MAQ001',
      nome: 'Torno CNC 001',
      tipo: 'Torno CNC',
      fabricante: 'Romi',
      modelo: 'Galaxy 20',
      anoFabricacao: 2020,
      numeroSerie: 'RG20-2020-001',
      localizacao: 'Setor A - Linha 1',
      status: 'operacional',
      criticidade: 'alta',
      horasOperacao: 15420,
      ultimaManutencao: '2024-01-15',
      proximaManutencao: '2024-04-15',
      criadoEm: new Date().toISOString(),
      criadoPor: 'Sistema',
    }
  ];

  const saved = loadFromStorage<Maquina>(STORAGE_KEYS.MAQUINAS);
  return saved.length > 0 ? saved : defaultMaquinas;
};

export const saveTemposParada = (tempos: TempoParada[]): void => {
  saveToStorage(STORAGE_KEYS.TEMPOS_PARADA, tempos);
};

export const loadTemposParada = (): TempoParada[] => {
  return loadFromStorage<TempoParada>(STORAGE_KEYS.TEMPOS_PARADA);
};