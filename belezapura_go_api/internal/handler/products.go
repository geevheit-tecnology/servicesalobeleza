package handler

import (
	"belezapura_go_api/internal/db"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"math"
	"strings"
)

type productInput struct {
	Name        string  `json:"nome" binding:"required,max=160"`
	Category    string  `json:"categoria" binding:"max=100"`
	Quantity    int     `json:"qtde" binding:"gte=0"`
	Minimum     int     `json:"min" binding:"gte=0"`
	Price       float64 `json:"price" binding:"gte=0"`
	InternalUse bool    `json:"usoInterno"`
	ForSale     bool    `json:"venda"`
	Version     int     `json:"version"`
}

func GetProducts(c *gin.Context) {
	var products []db.Product
	if err := db.DB.Where("salon_id = ?", c.GetString("salonId")).Order("created_at desc").Find(&products).Error; err != nil {
		bookingFailure(c, err)
		return
	}
	if products == nil {
		products = []db.Product{}
	}
	c.JSON(200, products)
}
func bindProduct(c *gin.Context) (productInput, bool) {
	var b productInput
	if c.ShouldBindJSON(&b) != nil || strings.TrimSpace(b.Name) == "" || math.IsNaN(b.Price) || math.IsInf(b.Price, 0) {
		c.JSON(400, gin.H{"error": "Produto inválido."})
		return b, false
	}
	return b, true
}
func CreateProduct(c *gin.Context) {
	b, ok := bindProduct(c)
	if !ok {
		return
	}
	p := db.Product{SalonID: c.GetString("salonId"), Name: strings.TrimSpace(b.Name), Category: b.Category, Quantity: b.Quantity, Minimum: b.Minimum, Price: b.Price, InternalUse: b.InternalUse, ForSale: b.ForSale, Version: 1}
	if err := db.DB.Create(&p).Error; err != nil {
		bookingFailure(c, err)
		return
	}
	c.JSON(201, p)
}
func UpdateProduct(c *gin.Context) {
	b, ok := bindProduct(c)
	if !ok {
		return
	}
	if b.Version < 1 {
		c.JSON(400, gin.H{"error": "Informe a versão do produto."})
		return
	}
	result := db.DB.Model(&db.Product{}).Where("id = ? AND salon_id = ? AND version = ?", c.Param("id"), c.GetString("salonId"), b.Version).Updates(map[string]interface{}{"name": strings.TrimSpace(b.Name), "category": b.Category, "quantity": b.Quantity, "minimum": b.Minimum, "price": b.Price, "internal_use": b.InternalUse, "for_sale": b.ForSale, "version": gorm.Expr("version + 1")})
	if result.Error != nil {
		bookingFailure(c, result.Error)
		return
	}
	if result.RowsAffected != 1 {
		c.JSON(409, gin.H{"error": "Produto alterado ou não encontrado. Atualize o estoque."})
		return
	}
	var p db.Product
	if err := db.DB.Where("id = ? AND salon_id = ?", c.Param("id"), c.GetString("salonId")).First(&p).Error; err != nil {
		bookingFailure(c, err)
		return
	}
	c.JSON(200, p)
}
func DeleteProduct(c *gin.Context) {
	result := db.DB.Where("id = ? AND salon_id = ?", c.Param("id"), c.GetString("salonId")).Delete(&db.Product{})
	if result.Error != nil {
		bookingFailure(c, result.Error)
		return
	}
	if result.RowsAffected != 1 {
		c.JSON(404, gin.H{"error": "Produto não encontrado."})
		return
	}
	c.Status(204)
}
