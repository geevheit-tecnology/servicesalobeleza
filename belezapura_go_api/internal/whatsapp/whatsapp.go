package whatsapp

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"
)

var httpClient = &http.Client{
	Timeout: 10 * time.Second,
}

// CleanPhoneNumber normaliza telefones brasileiros para o formato 55XXXXXXXXXXX
func CleanPhoneNumber(phone string) string {
	re := regexp.MustCompile(`\D`)
	digits := re.ReplaceAllString(phone, "")
	if len(digits) == 10 || len(digits) == 11 {
		digits = "55" + digits
	}
	return digits
}

// SendTextMessage envia uma mensagem de texto através do gateway Evolution API
func SendTextMessage(phone, text string) error {
	apiURL := strings.TrimRight(os.Getenv("WHATSAPP_API_URL"), "/")
	apiKey := os.Getenv("WHATSAPP_API_KEY")
	if apiURL == "" || apiKey == "" {
		log.Println("[WhatsApp] WHATSAPP_API_URL ou WHATSAPP_API_KEY não configurados. Disparo ignorado.")
		return nil
	}

	number := CleanPhoneNumber(phone)
	if len(number) < 12 {
		return fmt.Errorf("número de telefone inválido para WhatsApp: %s", phone)
	}

	payload := map[string]interface{}{
		"number": number,
		"text":   text,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	// Evolution API endpoint padrão de envio
	endpoint := fmt.Sprintf("%s/message/sendText/belezapura", apiURL)
	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, bytes.NewReader(data))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", apiKey)

	resp, err := httpClient.Do(req)
	if err != nil {
		log.Printf("[WhatsApp] Erro na comunicação com o gateway: %v", err)
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		log.Printf("[WhatsApp] Gateway retornou status de erro: %d", resp.StatusCode)
		return fmt.Errorf("whatsapp gateway status %d", resp.StatusCode)
	}

	log.Printf("[WhatsApp] Mensagem despachada com sucesso para %s", number)
	return nil
}

// DispatchBookingNotification formata e envia a notificação de novo agendamento de forma assíncrona
func DispatchBookingNotification(clientPhone, clientName, salonName, serviceName, proName, dateStr, pixCode string, deposit float64) {
	go func() {
		defer func() {
			if r := recover(); r != nil {
				log.Printf("[WhatsApp] Recuperado de pânico no envio: %v", r)
			}
		}()

		msg := fmt.Sprintf(
			"Olá, *%s*! ✨\n\nSeu agendamento no *%s* foi pré-reservado com sucesso!\n\n✂️ *Serviço:* %s\n👤 *Profissional:* %s\n📅 *Data/Horário:* %s",
			clientName, salonName, serviceName, proName, dateStr,
		)

		if deposit > 0 && pixCode != "" {
			msg += fmt.Sprintf(
				"\n\n🔑 *Sinal de reserva (Pix):* R$ %.2f\nPara garantir seu horário, utilize a chave Pix abaixo:\n`%s`\n\nApós o pagamento, seu horário estará 100%% garantido!",
				deposit, pixCode,
			)
		} else {
			msg += "\n\nEstamos ansiosos para receber você! Qualquer dúvida, basta responder esta mensagem."
		}

		_ = SendTextMessage(clientPhone, msg)
	}()
}

