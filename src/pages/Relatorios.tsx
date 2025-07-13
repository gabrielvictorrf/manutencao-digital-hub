import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Calculator
} from "lucide-react";

interface MaquinaMetricas {
  id: string;
  nome: string;
  mttr: number; // Mean Time To Repair (horas)
  mtbf: number; // Mean Time Between Failures (horas)
  disponibilidade: number; // %
  totalParadas: number;
  tempoTotalParada: number; // horas
  ordensManutencao: number;
  criticidade: "Baixa" | "Média" | "Alta";
}

export default function Relatorios() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("30");
  const [maquinaSelecionada, setMaquinaSelecionada] = useState("todas");

  // Dados simulados - serão substituídos por dados reais do Supabase
  const maquinasMetricas: MaquinaMetricas[] = [
    {
      id: "1",
      nome: "Torno CNC 01",
      mttr: 2.5,
      mtbf: 168,
      disponibilidade: 94.2,
      totalParadas: 5,
      tempoTotalParada: 12.5,
      ordensManutencao: 8,
      criticidade: "Alta"
    },
    {
      id: "2", 
      nome: "Fresadora 03",
      mttr: 3.2,
      mtbf: 145,
      disponibilidade: 91.8,
      totalParadas: 7,
      tempoTotalParada: 22.4,
      ordensManutencao: 12,
      criticidade: "Média"
    },
    {
      id: "3",
      nome: "Prensa 02",
      mttr: 1.8,
      mtbf: 220,
      disponibilidade: 96.5,
      totalParadas: 3,
      tempoTotalParada: 5.4,
      ordensManutencao: 4,
      criticidade: "Baixa"
    },
    {
      id: "4",
      nome: "Solda 01", 
      mttr: 4.1,
      mtbf: 120,
      disponibilidade: 88.3,
      totalParadas: 9,
      tempoTotalParada: 36.9,
      ordensManutencao: 15,
      criticidade: "Alta"
    }
  ];

  const getCriticidadeBadge = (criticidade: string) => {
    switch (criticidade) {
      case "Alta":
        return <Badge variant="destructive">Alta</Badge>;
      case "Média":
        return <Badge className="bg-orange-100 text-orange-800">Média</Badge>;
      case "Baixa":
        return <Badge className="bg-green-100 text-green-800">Baixa</Badge>;
      default:
        return <Badge variant="secondary">{criticidade}</Badge>;
    }
  };

  const getDisponibilidadeColor = (disponibilidade: number) => {
    if (disponibilidade >= 95) return "text-green-600";
    if (disponibilidade >= 90) return "text-orange-600";
    return "text-red-600";
  };

  const calcularMedias = () => {
    const mttrMedio = maquinasMetricas.reduce((acc, m) => acc + m.mttr, 0) / maquinasMetricas.length;
    const mtbfMedio = maquinasMetricas.reduce((acc, m) => acc + m.mtbf, 0) / maquinasMetricas.length;
    const disponibilidadeMedia = maquinasMetricas.reduce((acc, m) => acc + m.disponibilidade, 0) / maquinasMetricas.length;
    
    return {
      mttrMedio: Math.round(mttrMedio * 10) / 10,
      mtbfMedio: Math.round(mtbfMedio),
      disponibilidadeMedia: Math.round(disponibilidadeMedia * 10) / 10
    };
  };

  const medias = calcularMedias();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios MTTR/MTBF</h2>
          <p className="text-muted-foreground">
            Análise de indicadores de manutenção e disponibilidade
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
              <SelectItem value="365">1 ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={maquinaSelecionada} onValueChange={setMaquinaSelecionada}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as máquinas</SelectItem>
              {maquinasMetricas.map((maquina) => (
                <SelectItem key={maquina.id} value={maquina.id}>
                  {maquina.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Métricas Gerais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MTTR Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medias.mttrMedio}h</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />
              -12% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MTBF Médio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medias.mtbfMedio}h</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibilidade</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medias.disponibilidadeMedia}%</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.1% vs período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Máquinas Críticas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {maquinasMetricas.filter(m => m.criticidade === "Alta").length}
            </div>
            <p className="text-xs text-red-600">
              Requerem atenção especial
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Explicação dos Cálculos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Como os Indicadores são Calculados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-700">MTTR (Mean Time To Repair)</h4>
              <p className="text-sm text-muted-foreground">
                Tempo médio para reparo = Tempo total de reparo ÷ Número de falhas
              </p>
              <p className="text-xs text-muted-foreground">
                Indica a eficiência da equipe de manutenção
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-green-700">MTBF (Mean Time Between Failures)</h4>
              <p className="text-sm text-muted-foreground">
                Tempo médio entre falhas = Tempo total operacional ÷ Número de falhas
              </p>
              <p className="text-xs text-muted-foreground">
                Indica a confiabilidade do equipamento
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-700">Disponibilidade</h4>
              <p className="text-sm text-muted-foreground">
                Disponibilidade = (Tempo operacional ÷ Tempo total) × 100%
              </p>
              <p className="text-xs text-muted-foreground">
                Indica o percentual de tempo disponível
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhes por Máquina */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento por Máquina</CardTitle>
          <CardDescription>
            Métricas individuais de cada equipamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {maquinasMetricas.map((maquina) => (
              <div key={maquina.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-lg">{maquina.nome}</h3>
                    {getCriticidadeBadge(maquina.criticidade)}
                  </div>
                  <div className={`text-lg font-bold ${getDisponibilidadeColor(maquina.disponibilidade)}`}>
                    {maquina.disponibilidade}% disponível
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">{maquina.mttr}h</div>
                    <div className="text-sm text-blue-600">MTTR</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">{maquina.mtbf}h</div>
                    <div className="text-sm text-green-600">MTBF</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-700">{maquina.totalParadas}</div>
                    <div className="text-sm text-orange-600">Paradas</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">{maquina.ordensManutencao}</div>
                    <div className="text-sm text-purple-600">Ordens</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Disponibilidade</span>
                    <span className={getDisponibilidadeColor(maquina.disponibilidade)}>
                      {maquina.disponibilidade}%
                    </span>
                  </div>
                  <Progress value={maquina.disponibilidade} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Tempo total de parada: {maquina.tempoTotalParada}h
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}