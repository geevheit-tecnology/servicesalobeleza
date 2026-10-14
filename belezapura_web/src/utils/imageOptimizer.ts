/**
 * Utilitário de Padronização e Otimização de Imagens
 * Redimensiona e comprime imagens via HTML Canvas no próprio navegador
 * para evitar sobrecarga no banco de dados e garantir carregamento ultra-rápido.
 */

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0 (padrão: 0.75)
  format?: "image/jpeg" | "image/webp";
}

export const PRESETS = {
  avatar: { maxWidth: 360, maxHeight: 360, quality: 0.75 },
  logo: { maxWidth: 400, maxHeight: 400, quality: 0.8 },
  cover: { maxWidth: 1000, maxHeight: 500, quality: 0.75 },
  gallery: { maxWidth: 800, maxHeight: 800, quality: 0.75 },
} as const;

/**
 * Converte e otimiza um File de imagem para uma string base64 compactada
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<string> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.75,
    format = "image/jpeg"
  } = options;

  return new Promise((resolve, reject) => {
    // Validação básica do tipo
    if (!file.type.startsWith("image/")) {
      return reject(new Error("O arquivo selecionado não é uma imagem válida."));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo de imagem."));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Erro ao carregar a imagem para processamento."));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Cálculo de escala preservando proporção
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Não foi possível inicializar o canvas de renderização."));
        }

        // Fundo branco caso a imagem original tenha transparência PNG e convertamos para JPEG
        if (format === "image/jpeg") {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Exporta o base64 ultra leve
        const dataUrl = canvas.toDataURL(format, quality);
        resolve(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
