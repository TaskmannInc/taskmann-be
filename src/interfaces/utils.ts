interface line_item_object {
    id: string,
    service_name: string,
    pricetierid: string,
    service_date: Date,
    packageDetails: [
        {
            title: string,
            quantity: number,
            unitCost: number,
            totalCost: number,
        }]
}

export default line_item_object;
