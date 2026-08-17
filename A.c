#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#define max 100

typedef struct
{
    char activity[max];
    int start_time[max]; // Keeping start_time as an array
    int end_time[max];   // Keeping end_time as an array
} Activity;

void swap(void *a, void *b, size_t size)
{
    unsigned char temp[size];
    memcpy(temp, a, size);
    memcpy(a, b, size);
    memcpy(b, temp, size);
}

void display(Activity activities[], int n)
{
    int i;
    printf("S\t");
    for (i = 0; i < n; i++)
        printf("%s\t", activities[i].activity);

    printf("\nSi\t");
    for (i = 0; i < n; i++)
        printf("%d\t", activities[i].start_time[0]); // Access element 0

    printf("\nfi\t");
    for (i = 0; i < n; i++)
        printf("%d\t", activities[i].end_time[0]);   // Access element 0

    printf("\n");
}

void sort(Activity activities[], int n)
{
    int i, j;
    for (i = 0; i < n - 1; i++)
    {
        for (j = 0; j < n - i - 1; j++)
        {
            // Compare using end_time[0]
            if (activities[j].end_time[0] > activities[j + 1].end_time[0])
            {
                swap(&activities[j], &activities[j + 1], sizeof(activities[j]));
            }
        }
    }
}

void schedule(Activity activities[], int n)
{
    int i;
    int last_finish;
    printf("\nSelected Activities:\n");

    printf("%s ", activities[0].activity);
    last_finish = activities[0].end_time[0]; // Access element 0

    // Loop should start from index 1 since index 0 is already selected
    for (i = 1; i < n; i++)
    {
        if (activities[i].start_time[0] >= last_finish)
        {
            printf("%s ", activities[i].activity);
            last_finish = activities[i].end_time[0]; // Access element 0
        }
    }
    printf("\n");
}

int main()
{
    int n = 11;

    // Fixed initialization using extra braces for the array members
    Activity activities[] = {
        {"A1", {1}, {3}},
        {"A2", {2}, {5}},
        {"A3", {3}, {4}},
        {"A4", {4}, {7}},
        {"A5", {7}, {10}},
        {"A6", {8}, {9}},
        {"A7", {9}, {11}},
        {"A8", {9}, {13}},
        {"A9", {11}, {12}},
        {"A10", {12}, {14}},
        {"A11", {10}, {14}}

    };

    printf("\nActivities\n\n");
    display(activities, n);

    sort(activities, n);

    printf("\nArranging the Activities in Ascending Order Endtime\n\n");
    display(activities, n);

    schedule(activities, n);

    return -1;
}